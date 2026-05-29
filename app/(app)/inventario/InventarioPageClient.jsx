'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFinca } from '@/components/FincaProvider';
import { InventoryScreen } from '@/components/InventoryScreen';
import { AnimalDetail } from '@/components/AnimalDetail';
import { ExitForm } from '@/components/ExitForm';
import { EditAnimalForm } from '@/components/EditAnimalForm';
import { RegisterWizard } from '@/components/RegisterWizard';
import { EmptyFincaState } from '@/components/EmptyFincaState';
import { supabaseBrowser } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { normalizeAnimal } from '@/lib/normalize';
import { uploadAndAttachAnimalPhoto } from '@/lib/storage/animalPhotos';
import {
  registerAnimalAction,
  registerExitAction,
  updateAnimalDetailsAction,
} from '@/app/actions/animals';

const computeMetrics = (animals = [], personnelCount = 0) => {
  const activos = animals.filter(a => a.estado === 'activo');
  const out = ['vendido', 'muerto', 'robado', 'trasladado'];
  return {
    total: animals.length,
    activos: activos.length,
    hembras: activos.filter(a => a.sexo === 'H').length,
    machos: activos.filter(a => a.sexo === 'M').length,
    pesoTotal: activos.reduce((s, a) => s + (a.peso || 0), 0),
    salidas: animals.filter(a => out.includes(a.estado)).length,
    personal: personnelCount,
  };
};

export const InventarioPageClient = () => {
  const router = useRouter();
  const { finca, ready } = useFinca();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null); // 'detail' | 'exit' | 'wizard' | null
  const [saving, setSaving] = useState(false);

  const loadAnimals = useCallback(async () => {
    if (!finca || !isSupabaseConfigured()) {
      setAnimals([]);
      return [];
    }
    setLoading(true);
    try {
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('farm_id', finca.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const list = (data ?? []).map(normalizeAnimal);
      setAnimals(list);
      return list;
    } catch (err) {
      console.error('Error cargando animales:', err);
      setAnimals([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [finca]);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  if (!ready) return null;

  if (!finca) {
    return (
      <EmptyFincaState
        title="Selecciona una finca"
        description="El inventario se muestra por finca. Elige una para ver sus animales."
        ctaLabel="Ir a Mis fincas"
        onCta={() => router.push('/fincas')}
      />
    );
  }

  const metrics = computeMetrics(animals, 0);

  const handleRegister = async (data) => {
    setSaving(true);
    const res = await registerAnimalAction({ fincaId: finca.id, data });
    if (!res.ok) {
      setSaving(false);
      alert(res.error || 'Error al registrar el animal.');
      return;
    }
    if (data.photoFile && res.animal?.id) {
      try {
        await uploadAndAttachAnimalPhoto({
          farmId: finca.id,
          animalId: res.animal.id,
          file: data.photoFile,
          weightKg: data.peso ? Number(data.peso) : null,
          notes: 'Foto inicial',
        });
      } catch (err) {
        console.error('Error subiendo foto:', err);
        alert('El animal se creó, pero la foto no se pudo subir: ' + (err?.message || err));
      }
    }
    setSaving(false);
    setModal(null);
    loadAnimals();
    router.refresh();
  };

  const handleEdit = async (payload) => {
    if (!selected) return;
    setSaving(true);
    const res = await updateAnimalDetailsAction({
      animalId: selected.id,
      farmId: finca.id,
      categoria: payload.categoria,
      proposito: payload.proposito,
      peso: payload.peso,
      motivo: payload.motivo,
      pesoChanged: payload.pesoChanged,
    });
    if (!res.ok) {
      setSaving(false);
      alert(res.error || 'Error al actualizar el animal.');
      return;
    }
    if (payload.photoFile) {
      try {
        await uploadAndAttachAnimalPhoto({
          farmId: finca.id,
          animalId: selected.id,
          file: payload.photoFile,
          weightKg: payload.peso ? Number(payload.peso) : null,
          notes: 'Actualización',
        });
      } catch (err) {
        console.error('Error subiendo foto:', err);
        alert('Los cambios se guardaron, pero la foto no se subió: ' + (err?.message || err));
      }
    }
    setSaving(false);
    const list = await loadAnimals();
    const fresh = list.find((a) => a.id === selected.id);
    if (fresh) setSelected(fresh);
    setModal('detail');
    router.refresh();
  };

  const handleExit = async (payload) => {
    setSaving(true);
    const res = await registerExitAction({
      animalId: selected.id,
      farmId: finca.id,
      cause: payload.causa?.toLowerCase(),
      amount: payload.precio ? Number(payload.precio) : null,
      buyer: payload.comprador || null,
      destination: payload.destino || payload.fincaDestino || null,
      date: payload.fecha,
      document: payload.documento || payload.guia || payload.denuncia || null,
      description: payload.descripcion || null,
    });
    setSaving(false);
    if (!res.ok) {
      alert(res.error || 'Error al registrar salida.');
      return;
    }
    setModal(null);
    setSelected(null);
    loadAnimals();
    router.refresh();
  };

  return (
    <>
      <InventoryScreen
        finca={finca}
        animals={animals}
        metrics={metrics}
        loading={loading}
        onOpenAnimal={(a) => { setSelected(a); setModal('detail'); }}
        onNewAnimal={() => setModal('wizard')}
      />

      {modal === 'wizard' && (
        <RegisterWizard
          finca={finca}
          animals={animals}
          saving={saving}
          onClose={() => !saving && setModal(null)}
          onSubmit={handleRegister}
        />
      )}
      {modal === 'detail' && selected && (
        <AnimalDetail
          animal={selected}
          onClose={() => setModal(null)}
          onExit={() => setModal('exit')}
          onEdit={() => setModal('edit')}
        />
      )}
      {modal === 'edit' && selected && (
        <EditAnimalForm
          animal={selected}
          saving={saving}
          onClose={() => !saving && setModal('detail')}
          onConfirm={handleEdit}
        />
      )}
      {modal === 'exit' && selected && (
        <ExitForm
          animal={selected}
          saving={saving}
          onClose={() => !saving && setModal('detail')}
          onConfirm={handleExit}
        />
      )}
    </>
  );
};

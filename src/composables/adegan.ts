import { inject, type InjectionKey, type Ref } from 'vue'

export interface KonteksAdegan {
  kode: string
  langkahAktif: Ref<number>
  jumlahLangkah: Ref<number>
  progres: Ref<number>
  gerakDikurangi: Readonly<Ref<boolean>>
}

export const KUNCI_ADEGAN: InjectionKey<KonteksAdegan> = Symbol('adegan')

/** Dipakai StepBlock dan komponen viz untuk membaca keadaan adegan induknya. */
export function pakaiAdegan(): KonteksAdegan {
  const konteks = inject(KUNCI_ADEGAN, null)
  if (!konteks) {
    throw new Error('Komponen ini harus berada di dalam SceneLayout.')
  }
  return konteks
}

/** Daftar adegan untuk rel progres dan mode lompat cepat. */
export interface RingkasanAdegan {
  id: string
  kode: string
  judul: string
}

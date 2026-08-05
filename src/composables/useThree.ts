import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import type * as Three from 'three'

interface OpsiRuangVektor {
  wadah: Ref<HTMLElement | null>
  jumlahDokumen: number
  jumlahKueri: number
  similarity: number
  gerakDikurangi: Ref<boolean>
  langkah: Ref<number>
}

/** Lifecycle WebGL S07: buat saat terlihat, hentikan dan dispose saat ditinggalkan. */
export function useThree(opsi: OpsiRuangVektor) {
  let THREE: typeof Three | null = null
  let renderer: Three.WebGLRenderer | null = null
  let scene: Three.Scene | null = null
  let camera: Three.PerspectiveCamera | null = null
  let grup: Three.Group | null = null
  let frame = 0
  let observer: IntersectionObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let waktuAwal = 0
  let jumlahFrame = 0
  let terlihat = false

  const warna = (nama: string, cadangan: string) => {
    const nilai = getComputedStyle(document.documentElement).getPropertyValue(nama).trim()
    return nilai || cadangan
  }

  const ubahUkuran = () => {
    if (!renderer || !camera || !opsi.wadah.value) return
    const { clientWidth: lebar, clientHeight: tinggi } = opsi.wadah.value
    if (!lebar || !tinggi) return
    renderer.setSize(lebar, tinggi, false)
    camera.aspect = lebar / tinggi
    camera.updateProjectionMatrix()
  }

  const dispose = () => {
    cancelAnimationFrame(frame)
    frame = 0
    resizeObserver?.disconnect()
    resizeObserver = null
    scene?.traverse((objek) => {
      if (!THREE || !(objek instanceof THREE.Mesh || objek instanceof THREE.Points || objek instanceof THREE.Line)) return
      objek.geometry.dispose()
      const material = objek.material
      if (Array.isArray(material)) material.forEach((item) => item.dispose())
      else material.dispose()
    })
    renderer?.dispose()
    renderer?.forceContextLoss()
    renderer?.domElement.remove()
    renderer = null
    scene = null
    camera = null
    grup = null
    if (opsi.wadah.value) opsi.wadah.value.dataset.webglState = 'disposed'
  }

  const gambar = (waktu: number) => {
    if (!renderer || !scene || !camera || !grup || !opsi.wadah.value) return
    if (opsi.langkah.value > 0) grup.rotation.y += 0.0018
    renderer.render(scene, camera)
    jumlahFrame += 1
    if (!waktuAwal) waktuAwal = waktu
    const rentang = waktu - waktuAwal
    if (rentang >= 1000) {
      opsi.wadah.value.dataset.fps = String(Math.round((jumlahFrame * 1000) / rentang))
      waktuAwal = waktu
      jumlahFrame = 0
    }
    frame = requestAnimationFrame(gambar)
  }

  const buat = async () => {
    const wadah = opsi.wadah.value
    if (!wadah || renderer) return
    THREE ??= await import('three')
    if (!wadah.isConnected || !terlihat || renderer) return

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.25, 6.4)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    wadah.append(renderer.domElement)

    grup = new THREE.Group()
    grup.rotation.set(-0.18, -0.28, 0)
    scene.add(grup)

    const sorot = new THREE.Color(warna('--color-sorot', '#e5a445'))
    const benar = new THREE.Color(warna('--color-benar', '#7fb08a'))
    const garis = new THREE.Color(warna('--color-garis-tegas', '#453a24'))
    const teksRedup = new THREE.Color(warna('--color-teks-redup', '#b9ae97'))
    const radius = 1.82

    const bola = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 30, 20),
      new THREE.MeshBasicMaterial({ color: garis, wireframe: true, transparent: true, opacity: 0.34 }),
    )
    grup.add(bola)

    const posisiDokumen = new Float32Array(opsi.jumlahDokumen * 3)
    const rasioEmas = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < opsi.jumlahDokumen; i += 1) {
      const y = 1 - (i / Math.max(opsi.jumlahDokumen - 1, 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = rasioEmas * i
      posisiDokumen[i * 3] = Math.cos(theta) * r * radius
      posisiDokumen[i * 3 + 1] = y * radius
      posisiDokumen[i * 3 + 2] = Math.sin(theta) * r * radius
    }
    const geometriDokumen = new THREE.BufferGeometry()
    geometriDokumen.setAttribute('position', new THREE.BufferAttribute(posisiDokumen, 3))
    grup.add(new THREE.Points(geometriDokumen, new THREE.PointsMaterial({ color: teksRedup, size: 0.045, transparent: true, opacity: 0.72 })))

    const posisiKueri = new Float32Array(opsi.jumlahKueri * 3)
    for (let i = 0; i < opsi.jumlahKueri; i += 1) {
      const theta = (i / Math.max(opsi.jumlahKueri, 1)) * Math.PI * 2
      posisiKueri[i * 3] = Math.cos(theta) * radius
      posisiKueri[i * 3 + 1] = Math.sin(theta * 0.65) * radius * 0.48
      posisiKueri[i * 3 + 2] = Math.sin(theta) * radius
    }
    const geometriKueri = new THREE.BufferGeometry()
    geometriKueri.setAttribute('position', new THREE.BufferAttribute(posisiKueri, 3))
    grup.add(new THREE.Points(geometriKueri, new THREE.PointsMaterial({ color: sorot, size: 0.105 })))

    const query = new THREE.Vector3(1, 0, 0)
    const dokumen = new THREE.Vector3(opsi.similarity, Math.sqrt(1 - opsi.similarity ** 2), 0)
    grup.add(new THREE.ArrowHelper(query, new THREE.Vector3(), radius, sorot, 0.12, 0.07))
    grup.add(new THREE.ArrowHelper(dokumen, new THREE.Vector3(), radius, benar, 0.12, 0.07))

    const sudut = Math.acos(opsi.similarity)
    const Vector3 = THREE.Vector3
    const titikBusur = Array.from({ length: 25 }, (_, i) => {
      const theta = (sudut * i) / 24
      return new Vector3(Math.cos(theta) * 0.62, Math.sin(theta) * 0.62, 0)
    })
    const geometriBusur = new THREE.BufferGeometry().setFromPoints(titikBusur)
    grup.add(new THREE.Line(geometriBusur, new THREE.LineBasicMaterial({ color: sorot })))

    ubahUkuran()
    resizeObserver = new ResizeObserver(ubahUkuran)
    resizeObserver.observe(wadah)
    waktuAwal = 0
    jumlahFrame = 0
    wadah.dataset.webglState = opsi.gerakDikurangi.value ? 'static' : 'active'
    if (opsi.gerakDikurangi.value) renderer.render(scene, camera)
    else frame = requestAnimationFrame(gambar)
  }

  onMounted(() => {
    observer = new IntersectionObserver(([entri]) => {
      terlihat = Boolean(entri?.isIntersecting)
      if (entri?.isIntersecting) void buat()
      else if (renderer) dispose()
    }, { rootMargin: '120px 0px', threshold: 0.01 })
    if (opsi.wadah.value) observer.observe(opsi.wadah.value)
  })

  watch(opsi.gerakDikurangi, () => {
    if (!renderer || !scene || !camera || !opsi.wadah.value) return
    cancelAnimationFrame(frame)
    frame = 0
    opsi.wadah.value.dataset.webglState = opsi.gerakDikurangi.value ? 'static' : 'active'
    if (opsi.gerakDikurangi.value) {
      delete opsi.wadah.value.dataset.fps
      renderer.render(scene, camera)
    }
    else frame = requestAnimationFrame(gambar)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    dispose()
  })
}

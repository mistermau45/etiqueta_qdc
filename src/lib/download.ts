function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export function nomeDoArquivo(projeto: string, ext = 'pdf'): string {
  const base = normalizar(projeto).slice(0, 60)
  return `${base || 'quadro-identificado'}.${ext}`
}

export function baixarPdf(dados: Uint8Array, nome: string): void {
  const copia = new Uint8Array(dados)
  const url = URL.createObjectURL(new Blob([copia.buffer as ArrayBuffer], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function baixarTexto(texto: string, nome: string, tipo = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function lerArquivo(arquivo: File): Promise<string> {
  return arquivo.text()
}

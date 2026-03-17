export function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1.5">{msg}</p>
}

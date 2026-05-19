import { BoardClient } from './BoardClient'

// Static params for export - generates placeholder routes
export function generateStaticParams() {
  return [
    { id: 'placeholder' },
    { id: 'static1' },
    { id: 'static2' }
  ]
}

export default function BoardPage() {
  return <BoardClient />
}

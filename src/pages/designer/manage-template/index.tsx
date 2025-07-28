import { useState } from 'react'
import CreatePresetModal from './components/create-preset-modal'

const ManageTemplatePage = () => {
  const [open, setOpen] = useState(false)
  return <CreatePresetModal open={open} onOpenChange={setOpen} />
}

export default ManageTemplatePage

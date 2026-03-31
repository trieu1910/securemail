import { AppShell } from '../components/layout/AppShell'
import { ComposeModal } from '../components/compose/ComposeModal'
import { MailView } from './MailView'
import { useMailStore } from '../store/mailStore'
import { useMail } from '../hooks/useMail'
import { useAuth } from '../hooks/useAuth'

export function Inbox() {
  const { isComposing } = useMailStore()
  const { refresh } = useMail()
  useAuth()  // ensures user profile is loaded

  return (
    <>
      <AppShell>
        <MailView />
      </AppShell>
      {isComposing && <ComposeModal onSent={refresh} />}
    </>
  )
}

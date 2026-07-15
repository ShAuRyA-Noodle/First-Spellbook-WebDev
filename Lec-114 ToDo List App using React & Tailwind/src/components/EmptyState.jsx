import { FiCheckCircle, FiInbox, FiSun } from 'react-icons/fi'

const COPY = {
  all: {
    icon: FiInbox,
    title: 'Nothing here yet',
    subtitle: 'Add your first task above to get started.',
  },
  active: {
    icon: FiCheckCircle,
    title: 'All caught up',
    subtitle: 'No active tasks right now — nice work.',
  },
  completed: {
    icon: FiSun,
    title: 'No completed tasks',
    subtitle: 'Finish a task and it will show up here.',
  },
}

/** Shown instead of the list whenever the current filter has nothing to show. */
function EmptyState({ filter }) {
  const { icon: Icon, title, subtitle } = COPY[filter] ?? COPY.all

  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-ink-tertiary">
        <Icon size={20} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{title}</p>
      <p className="text-xs text-ink-tertiary">{subtitle}</p>
    </div>
  )
}

export default EmptyState

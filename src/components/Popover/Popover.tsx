import './Popover.scss'
import type { PopoverProps } from '@/types/utils.ts'

const Popover = ({ children, placement = 'bottom-right' }: PopoverProps) => {
	return <div className={`popover popover--${placement}`}>{children}</div>
}

export default Popover

import type { SectionHeaderProps } from '@/types/utils.ts'
import './SectionHeader.scss'

const SectionHeader = ({ title, counterText, buttonText, onButtonClick }: SectionHeaderProps) => {
	return (
		<div className="section-header">
			<h2 className="section-header__title">{title}</h2>
			<span className="section-header__counter">{counterText}</span>
			<button type="button" className="section-header__button" onClick={onButtonClick}>
				{buttonText}
			</button>
		</div>
	)
}

export default SectionHeader

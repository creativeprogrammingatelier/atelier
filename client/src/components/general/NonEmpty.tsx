import {Children, Parent, ParentalProperties} from '../../helpers/ParentHelper';

interface NonEmptyProperties extends ParentalProperties {
	/** Defines variable to be used if no children are passed */
	empty?: Children
}
/**
 * Component that, if no children are passed, will fallback to a empty child, thus never actually being empty.
 */
export function NonEmpty({empty, children}: NonEmptyProperties) {
  return Parent.constructChildren(Parent.countChildren(children) > 0 ? children : empty);
}

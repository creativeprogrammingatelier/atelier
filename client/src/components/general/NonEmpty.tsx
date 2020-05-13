import {Children, Parent, ParentalProperties} from "../../helpers/ParentHelper";

interface NonEmptyProperties extends ParentalProperties {
	empty?: Children
}
export function NonEmpty({empty, children}: NonEmptyProperties) {
	return Parent.constructChildren(Parent.countChildren(children) > 0 ? children : empty);
}
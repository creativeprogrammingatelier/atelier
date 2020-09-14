import React, { Fragment, ReactElement } from 'react';
import { Permissions, PermissionsProperties } from './Permissions';
import { OptionalLink } from './OptionalLink';

interface BreadcrumbsProperties {
    children: ReactElement<CrumbProperties> | Array<ReactElement<CrumbProperties>>
}

export function Breadcrumbs({ children }: BreadcrumbsProperties) {
    const items = children instanceof Array ? children : [children];
    return (
        <div className="breadcrumbs">
            {items.map(link => <Fragment key={link.props.link || link.props.text}>{link}<span className="sep">/</span></Fragment>)}
        </div>
    );
}

interface CrumbProperties {
    link?: string,
    text: string
}

export function Crumb({ link, text }: CrumbProperties) {
    return (<OptionalLink to={link}>{text}</OptionalLink>);
}

/** Crumb that only shows a link if the user has the correct permissions, otherwise displayed as text */
export function PermissionsCrumb({ link, text, ...perm }: CrumbProperties & PermissionsProperties) {
    return Permissions({ ...perm, children: <Crumb text={text} link={link} />, error: <Crumb text={text} /> });
}
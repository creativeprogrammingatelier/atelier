import React, { Fragment, ReactElement } from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbsProperties {
    children: ReactElement<CrumbProperties> | Array<ReactElement<CrumbProperties>>
}

export function Breadcrumbs({ children }: BreadcrumbsProperties) {
    const items = children instanceof Array ? children : [children];
    return (
        <div className="breadcrumbs">
            {items.map(link => <Fragment key={link.props.link}>{link}<span className="sep">/</span></Fragment>)}
        </div>
    );
}

interface CrumbProperties {
    link: string,
    text: string
}

export function Crumb({ link, text }: CrumbProperties) {
    return (<Link to={link}>{text}</Link>);
}

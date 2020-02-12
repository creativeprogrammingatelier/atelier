import React from 'react';

interface HeaderProperties { 
    title: string 
}

export function Header({ title } : HeaderProperties) {
    return (
        <header>
            <h1>{title}</h1>
        </header>
    );
}
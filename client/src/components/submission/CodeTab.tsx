import React from 'react';

export function CodeTab() {
    return (
        <div>
            <h1>Code Tab</h1>
            <textarea>
                branch('feature/viewCode')
                checkout('feature/viewCode')
                writeCode()
                add('.')
                commit('implemented feature view code')
                push()
                checkout()
                merge('feature/viewCode')
                push()
            </textarea>
        </div>
    )
}
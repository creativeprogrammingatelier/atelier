import 'mocha';
import { expect } from 'chai';
import Adapter from 'enzyme-adapter-react-16';
import { configure, shallow } from 'enzyme';

import React from 'react';

import { Loading } from '../src/components/general/loading/Loading';

configure({adapter: new Adapter()});

describe("<Loading />", () => {
    const value = "Testing value";
    const error = { error: "test.expected", message: "Testing error" };
    const innerComponent = (data: string) => <span>{data}</span>;

    it("should display loading on start", async () => {
        const loading = shallow(<Loading loader={() => Promise.resolve(value)} component={innerComponent} />);
        
        const span = loading.find("span");
        expect(span.text()).to.contain("Loading");
    });

    // TODO: try to find a way to wait for promise resolve
});
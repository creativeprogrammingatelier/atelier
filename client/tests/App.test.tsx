import React from 'react';
import ReactDOM from 'react-dom';
import { configure, shallow } from 'enzyme';
import { expect } from 'chai';
import App from '../src/components/App';
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() });
const wrapper = shallow(<App />); 

describe('<App />', () => {
    it('should always render a navbar', () => {
        expect(wrapper.find('nav').length).to.equal(1);
    });
  });
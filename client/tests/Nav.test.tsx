import React from 'react';
import ReactDOM from 'react-dom';
import {configure, shallow} from 'enzyme';
import {expect} from 'chai';
import Nav from '../src/components/Nav';

import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

describe('<Nav />', () => {

	describe('when logged in', () => {

		const wrapper = shallow(<Nav loggedIn={true}/>);

		it('should show a link to "Logout"', () => {
			expect(wrapper.contains('Logout')).to.equal(true);
		});

		it('should show a link to "Submissions"', () => {
			expect(wrapper.contains('Submissions')).to.equal(true);
		});

		it('should not show a link to "login"', () => {
			expect(wrapper.contains('Login')).to.equal(false);
		});

		it('should not show a link to "Register"', () => {
			expect(wrapper.contains('Register')).to.equal(false);
		});

	});

	describe('when not logged in', () => {

		const wrapper = shallow(<Nav loggedIn={false}/>);

		it('should show a link to "login"', () => {
			expect(wrapper.contains('Login')).to.equal(true);
		});

		it('should show a link to "register"', () => {
			expect(wrapper.contains('Register')).to.equal(true);
		});

		it('should not show a link to "logout"', () => {
			expect(wrapper.contains('Logout')).to.equal(false);
		});

		it('should not show a link to "roleview"', () => {
			expect(wrapper.contains('Submissions')).to.equal(false);
		});

	});
});
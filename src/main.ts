import { mount } from 'svelte';
import './styles/global.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('index.html is missing the #app mount point');

export default mount(App, { target });

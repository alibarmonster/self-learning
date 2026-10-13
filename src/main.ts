import { mount } from 'svelte';
// Self-hosted variable fonts: the CSP allows fonts from this origin only.
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import './styles/global.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (!target) throw new Error('index.html is missing the #app mount point');

export default mount(App, { target });

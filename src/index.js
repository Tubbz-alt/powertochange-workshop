import classes from "./app.css";
import { h, render } from 'preact';
import Scene from './scene';

render((
	<Scene width={800} height={800} />
), document.getElementById('container'));

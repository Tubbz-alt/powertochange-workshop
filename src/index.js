import classes from "./app.css";
import { h, render } from 'preact';
import Scene from './scene';
import GithubCorner from './github_corner';
import Stats from './stats';

render((
	<div>
		<Scene width={window.innerWidth} height={window.innerHeight} />
		<GithubCorner repo="johnrees/powertochange-workshop" />
		<Stats />
	</div>
), document.getElementById('container'));

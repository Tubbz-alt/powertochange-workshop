import classes from "./app.css";
import { h, render } from 'preact';
import Scene from './scene';
import GithubCorner from './github_corner';

render((
	<div>
		<Scene width={800} height={800} />
		<GithubCorner repo="johnrees/powertochange-workshop" />
	</div>
), document.getElementById('container'));

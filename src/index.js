import classes from "./index.css";
import { h, render } from 'preact';
import Scene from './scene';
import GithubCorner from './ui/github_corner';
import Stats from './ui/stats';

render((
	<div>
		<Scene width={window.innerWidth} height={window.innerHeight} />
		<GithubCorner repo="johnrees/powertochange-workshop" />
		<Stats />
	</div>
), document.getElementById('container'));

if (module.hot) {
  module.hot.dispose(function () {
		// remove WebGL context then force reload the page
		var canvas = document.querySelector('canvas');
		var gl = canvas.getContext('webgl');
		canvas.addEventListener('webglcontextlost', function(e) {
			console.clear();
			window.location.reload();
		}, false);
		gl.getExtension('WEBGL_lose_context').loseContext();
  });

  module.hot.accept(function () {
    // module or one of its dependencies was just updated
  });
}

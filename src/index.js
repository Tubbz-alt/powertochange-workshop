import classes from "./index.css";
import { h, render, Component } from 'preact';
import Scene from './scene';
import GithubCorner from './ui/github_corner';
import Stats from './ui/stats';
import Measurement from './ui/measurement';

class App extends Component {

	constructor(props) {
		super(props);
		this.state = {
			metrics: {
				floors: [1, ''],
				width: [0, 'm'],
				height: [0, 'm'],
				length: [0, 'm'],
				// endWallArea: [0, 'm²'],
			},
			measurements: {
				width: {
					x: 5,
					y: 10
				},
				height: {
					x: 10,
					y: 100
				}
			}
		}
	}

	updateMetrics(newVals) {
		this.setState(prevState => {
			prevState.metrics = Object.assign({}, prevState.metrics, newVals);
			return prevState;
		})
	}

	updateMeasurements(newVals) {
		this.setState(prevState => {
			prevState.measurements = Object.assign({}, prevState.measurements, newVals);
			return prevState;
		});
	}

	render() {
		return (
			<div>
				<Scene
					width={window.innerWidth}
					height={window.innerHeight}
					updateMetrics={this.updateMetrics.bind(this)}
					updateMeasurements={this.updateMeasurements.bind(this)}
				/>
				{
					Object.entries(this.state.measurements).map( ([title, props]) =>
						<Measurement title={title} {...props} value={this.state.metrics[title][0].toFixed(2)} />
					)
				}
				<GithubCorner repo="johnrees/powertochange-workshop" />
				<Stats metrics={this.state.metrics} />
			</div>
		);
	}

}

render(<App />, document.getElementById('container'));

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

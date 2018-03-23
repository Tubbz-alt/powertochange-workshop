import { h } from 'preact';
import "./stats.css";

// const data = {
//   width: [10, 'm'],
//   height: [5, 'm'],
//   length: [7, 'm'],
// }

function formatValue(key, value) {
  switch(key) {
    case "floors":
      return value;
    default:
      return value.toFixed(2);
  }
}

export default function Stats({ metrics }) {
  return (
    <div class="stats">
      <table>
        <tbody>
          {
            Object.entries(metrics).map( ([name, [value, unit]]) =>
              <tr>
                <th>{name}</th>
                <td>{formatValue(name, value)}{unit}</td>
              </tr>
            )
          }
          <tr>
            <th>footprint</th>
            <td>{(metrics.width[0] * metrics.length[0]).toFixed(2)}m²</td>
          </tr>
          {/* <tr>
            <th>volume</th>
            <td>{(metrics.endWallArea[0] * metrics.length[0]).toFixed(2)}m³</td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
}

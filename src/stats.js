import { h } from 'preact';
import "./stats.css";

const data = {
  width: [10, 'm'],
  height: [5, 'm'],
  length: [7, 'm'],
}

export default function Stats() {
  return (
    <div class="stats">
      <table>
        <tbody>
          {
            Object.entries(data).map( ([name, [value, unit]]) =>
              <tr>
                <th>{name}</th>
                <td>{value}{unit}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </div>
  );
}

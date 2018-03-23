import { h, Component } from "preact";
import "./measurement.css";

export default function Measurement({ value = 0, x = 0, y = 0, title = "untitled" }) {
  return (
    <span title={title} style={{ left: x, top: y }} class="measurement">
      {value}
    </span>
  );
}

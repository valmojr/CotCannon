import { CursorOverTime, type FunctionRole, type GroupColor } from "./cot"

export default class DigitalPointer implements CursorOverTime {
  uuid: string;
  callsign: string;
  role: FunctionRole;
  groupColor: GroupColor;
  lat: number;
  lon: number;

  constructor({
    callsign,
    role,
    groupColor,
    lat,
    lon,
  }: {
    callsign: string;
    role: FunctionRole;
    groupColor: GroupColor;
    lat: number;
    lon: number;
  }) {
    this.uuid = crypto.randomUUID();
    this.callsign = callsign;
    this.role = role;
    this.groupColor = groupColor;
    this.lat = lat;
    this.lon = lon;
  }

  toXML() {
    const now = new Date().toISOString();
    const stale = new Date(Date.now() + 2000).toISOString();

    return `\n
      <event version="2.0" uid="${this.uuid}.SPI1" type="b-m-p-s-p-i"
        time="${now}" start="${now}" stale="${stale}"
        how="h-e" access="Undefined">
        <point lat="${this.lat}" lon="${this.lon}" hae="43.76" ce="9999999.0" le="9999999.0" />
        <detail>
          <contact callsign="${this.callsign}.DP1" />
          <link uid="${this.uuid}" type="a-f-G-U-C" relation="p-p" />
          <creator uid="${this.uuid}" type="a-f-G-U-C" />
          <hideLabel />
          <precisionlocation altsrc="DTED0" />
        </detail>
      </event>
`.trim();
  }
}
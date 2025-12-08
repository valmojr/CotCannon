export enum FunctionRole {
  TeamLeader = "TeamLeader",
  TeamMember = "TeamMember",
  Sniper = "Sniper",
  K9Unit = "K9",
  HQ = "HQ",
  Medic = "Medic",
  FO = "Forward Observer",
  RTO = "RTO",
}

export enum GroupColor {
  White = "White",
  Yellow = "Yellow",
  Orange = "Orange",
  Magenta = "Magenta",
  Red = "Red",
  Maroon = "Maroon",
  Purple = "Purple",
  DarkBlue = "DarkBlue",
  Blue = "Blue",
  Cyan = "Cyan",
  Teal = "Teal",
  Green = "Green",
  DarkGreen = "DarkGreen",
  Brown = "Brown",
}

export class CursorOverTime {
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
      <event version="2.0" type="a-f-G-U-C" uid="${this.uuid}" time="${now}" start="${now}" stale="${stale}" how="m-g" access="Undefined">
        <point lat="${this.lat}" lon="${this.lon}" hae="10" ce="10.4" le="9999999.0"/>
        <detail>
          <takv os="35" version="CIV" device="COT CANNON" platform="ATAK-CIV"/>
          <contact endpoint="*:-1:stcp" callsign="${this.callsign}"/>
          <uid Droid="Valmo"/>
          <precisionlocation altsrc="GPS" geopointsrc="GPS"/>
          <__group name="${this.groupColor}" role="${this.role}"/>
          <status battery="30" readiness="true"/>
          <track course="256.36262193195086" speed="0.0"/>
          <remarks>Generated COT</remarks>
        </detail>
      </event>
`.trim();
  }
}

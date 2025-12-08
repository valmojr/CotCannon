import net from "net";
import { CursorOverTime, FunctionRole, GroupColor } from "./cot";
import { SERVER_ADDRESS, SERVER_PORT, GROUP_NUMBER } from "./config";

const greek = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function moveUnit(unit: CursorOverTime) {
  const dLat = (Math.random() - 0.5) * 0.0007 * 10;
  const dLon = (Math.random() - 0.5) * 0.0007 * 10;

  unit.lat += dLat;
  unit.lon += dLon;
}

function pickColor(): GroupColor {
  const colors = Object.values(GroupColor);
  return colors[Math.floor(Math.random() * colors.length)] as GroupColor;
}

function pickRandomRole(): FunctionRole {
  const r = [
    FunctionRole.Sniper,
    FunctionRole.K9Unit,
    FunctionRole.FO,
    FunctionRole.RTO,
    FunctionRole.HQ,
  ];
  return r[Math.floor(Math.random() * r.length)] as FunctionRole;
}

function generateGroups() {
  const groups: CursorOverTime[][] = [];

  for (let g = 0; g < 4; g++) {
    const groupColor = pickColor();
    const groupName = greek[g];

    const baseLat = -30.0 + g * 0.02;
    const baseLon = -51.0 + g * 0.02;

    const members: CursorOverTime[] = [];

    members.push(
      new CursorOverTime({
        callsign: `${groupName}-1`,
        role: FunctionRole.TeamLeader,
        groupColor,
        lat: baseLat,
        lon: baseLon,
      })
    );

    members.push(
      new CursorOverTime({
        callsign: `${groupName}-2`,
        role: FunctionRole.Medic,
        groupColor,
        lat: baseLat + random(-0.002, 0.002),
        lon: baseLon + random(-0.002, 0.002),
      })
    );

    const specialRole = pickRandomRole();
    members.push(
      new CursorOverTime({
        callsign: `${groupName}-3`,
        role: specialRole,
        groupColor,
        lat: baseLat + random(-0.002, 0.002),
        lon: baseLon + random(-0.002, 0.002),
      })
    );

    let num = 4;
    while (members.length <= GROUP_NUMBER) {
      members.push(
        new CursorOverTime({
          callsign: `${groupName}-${num}`,
          role: FunctionRole.TeamMember,
          groupColor,
          lat: baseLat + random(-0.003, 0.003),
          lon: baseLon + random(-0.003, 0.003),
        })
      );
      num++;
    }

    groups.push(members);
  }

  return groups;
}

function startConnections(groups: CursorOverTime[][]) {
  for (const group of groups) {
    for (const unit of group) {
      const socket = new net.Socket();

      socket.connect(SERVER_PORT, SERVER_ADDRESS, () => {
        console.log(`Connected: ${unit.callsign}`);

        setInterval(() => {
          moveUnit(unit);
          const xml = unit.toXML();
          socket.write(xml + "\n");
        }, 1000);
      });

      socket.on("error", (err: Error) => {
        console.error(`Socket error for ${unit.callsign}`, err);
      });
    }
  }
}

const groups = generateGroups();
startConnections(groups);

console.log("COT generator started...");

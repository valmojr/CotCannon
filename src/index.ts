import net from "net";
import dgram from "dgram";
import { CursorOverTime, FunctionRole, GroupColor } from "./model/cot";
import {
  SERVER_ADDRESS,
  SERVER_PORT,
  GROUP_NUMBER,
  SOCKET_TYPE,
} from "./config";

const greek = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliet",
  "Kilo",
  "Lima",
  "Mike",
  "November",
  "Oscar",
  "Papa",
  "Quebec",
  "Romeo",
  "Sierra",
  "Tango",
  "Uniform",
  "Victor",
  "Whiskey",
  "X-ray",
  "Yankee",
  "Zulu",
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

  for (let g = 0; g <= GROUP_NUMBER; g++) {
    const groupColor = pickColor();
    const groupName = greek[g];

    const baseLat = 0.0 + g * 0.02;
    const baseLon = 0.0 + g * 0.02;

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

//
// ─── INPUT LOGGING ADDED HERE ───────────────────────────────
//

let udpListenerStarted = false;
const udpReceiver = dgram.createSocket("udp4");

if (SOCKET_TYPE === "UDP") {
  if (!udpListenerStarted) {
    udpListenerStarted = true;

    udpReceiver.on("message", (msg, rinfo) => {
      console.log(
        `📩 UDP INPUT from ${rinfo.address}:${rinfo.port}:\n${msg.toString()}`
      );
    });

    udpReceiver.bind(SERVER_PORT, () => {
      console.log(`UDP listener bound on port ${SERVER_PORT} for input logs`);
    });
  }
}

function startConnections(groups: CursorOverTime[][]) {
  console.log(`Starting connections to ${SERVER_ADDRESS}:${SERVER_PORT} via ${SOCKET_TYPE}`);
  for (const group of groups) {
    for (const unit of group) {
      if (SOCKET_TYPE === "TCP") {
        const socket = new net.Socket();

        socket.connect(SERVER_PORT, SERVER_ADDRESS, () => {
          console.log(`TCP Connected: ${unit.callsign}`);

          setInterval(() => {
            moveUnit(unit);
            const xml = unit.toXML();
            socket.write(xml + "\n");
          }, 1000);
        });

        //
        // ─── TCP INPUT LOGGING ──────────────────
        //
        socket.on("data", (data) => {
          console.log(`📩 TCP INPUT for ${unit.callsign}:\n${data.toString()}`);
        });

        socket.on("error", (err: Error) => {
          console.error(`Socket error for ${unit.callsign}`, err);
        });
      } else {
        const socket = dgram.createSocket("udp4");
        console.log(`UDP Started: ${unit.callsign}`);

        setInterval(() => {
          moveUnit(unit);
          const xml = unit.toXML();
          socket.send(xml, SERVER_PORT, SERVER_ADDRESS, (err) => {
            if (err) console.error(`UDP error for ${unit.callsign}`, err);
          });
        }, 1000);
      }
    }
  }
}

const groups = generateGroups();
startConnections(groups);

console.log("COT generator started...");

import net from "net";
import dgram from "dgram";
import { FunctionRole, GroupColor } from "./model/cot";
import { SERVER_ADDRESS, SERVER_PORT, SOCKET_TYPE } from "./config";
import DigitalPointer from "./model/sensor";

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

function startConnection() {
  const pointer = new DigitalPointer({
    callsign: "Valmo",
    role: FunctionRole.TeamMember,
    groupColor: GroupColor.Red,
    lat: -30.00000,
    lon: -51.00000,
  });
  console.log(
    `Starting connections to ${SERVER_ADDRESS}:${SERVER_PORT} via ${SOCKET_TYPE}`
  );
  if (SOCKET_TYPE === "TCP") {
    const socket = new net.Socket();

    socket.connect(SERVER_PORT, SERVER_ADDRESS, () => {
      console.log(`TCP Connected: ${pointer.callsign}`);

      setInterval(() => {
        const xml = pointer.toXML();
        socket.write(xml + "\n");
      }, 1000);
    });

    socket.on("data", (data) => {
      console.log(`📩 TCP INPUT for ${pointer.callsign}:\n${data.toString()}`);
    });

    socket.on("error", (err: Error) => {
      console.error(`Socket error for ${pointer.callsign}`, err);
    });
  } else {
    const socket = dgram.createSocket("udp4");
    console.log(`UDP Started: ${pointer.callsign}`);

    setInterval(() => {
      const xml = pointer.toXML();
      socket.send(xml, SERVER_PORT, SERVER_ADDRESS, (err) => {
        if (err) console.error(`UDP error for ${pointer.callsign}`, err);
      });
    }, 1000);
  }
}

startConnection();

console.log("DigitalPointer generator started...");

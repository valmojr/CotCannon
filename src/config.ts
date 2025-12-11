export const SERVER_ADDRESS: string = process.env.SERVER_ADDRESS || "192.168.15.10";
export const SERVER_PORT: number = Number(process.env.SERVER_PORT) || 4242;
export const GROUP_NUMBER: number = Number(process.env.GROUP_NUMBER) || 8;
export const SOCKET_TYPE: "TCP" | "UDP" = (process.env.SOCKET_TYPE === "TCP" ? "TCP" : "UDP");
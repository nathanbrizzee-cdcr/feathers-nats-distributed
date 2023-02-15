"use strict"
import { ServiceActions } from "./types"

/**
 * Replaces NATS special characters with safe characters
 * @param appName Applicaton name - usually package.json.name
 * @returns sanitized app name
 */
const sanitizeAppName = function (appName: string): string {
  // Takes a name like "@mycompany/server.name" and return "mycompany/server-name"
  //const newAppName = appName.split("/").pop()?.replace("@", "") || ""
  const newAppName =
    appName.replace(/@/g, "").replace(/./g, "-").replace(/>/g, "-") || "" // Replace NATS special characters
  return newAppName
}

/**
 * Parses a NATS message into the service name and endpoint name
 * @param natsSubject NATS subject to parse into a service and endpoint
 * @returns Service name and endpoint
 */
const getServiceName = function (natsSubject: string): ServiceActions {
  // natsSubject should look like this "ServerName.get.users"
  const subjectParts: string[] = natsSubject.split(".")
  const serviceActions: ServiceActions = {
    serverName: "",
    serviceName: "",
    methodName: "",
  }
  serviceActions.serverName = subjectParts[0]
  if (subjectParts.length > 1) {
    serviceActions.methodName = subjectParts[1]
  }
  if (subjectParts.length > 2) {
    serviceActions.serviceName = subjectParts.slice(2).join("/")
  }
  return serviceActions
}

export { sanitizeAppName, getServiceName }

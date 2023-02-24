"use strict"
import { ServiceActions, ServiceTypes, ServiceMethods } from "./types"

/**
 * Replaces NATS special characters with safe characters
 * @param appName Applicaton name - usually package.json.name
 * @returns sanitized app name
 */
const sanitizeAppName = function (appName: string): string {
  // Takes a name like "@mycompany/server.name" and return "mycompany/server-name"
  //const newAppName = appName.split("/").pop()?.replace("@", "") || ""
  const newAppName =
    appName.replace(/@/g, "").replace(/[&\/\\#,+()$%.'":*?<>{}]/g, "-") || "" // Replace NATS special characters
  return newAppName
}

/**
 * Parses a NATS message into the service name and endpoint name
 * @param natsSubject NATS subject to parse into a service and endpoint
 * @returns Service name and endpoint
 */
const getServiceName = function (natsSubject: string): ServiceActions {
  // natsSubject should look like this "service.ServerName.get.users"
  // or  "service.ServerName.create.api.pvdts.someintermediate.users"
  // or  "event.ServerName.update.api.users"
  const subjectParts: string[] = natsSubject.split(".")
  const serviceActions: ServiceActions = {
    serverName: "",
    servicePath: "",
    methodName: ServiceMethods.Unknown,
    serviceType: ServiceTypes.Unknown,
  }
  serviceActions.serviceType = subjectParts[0] as ServiceTypes
  if (subjectParts.length > 1) {
    serviceActions.serverName = subjectParts[1] as string
  }
  if (subjectParts.length > 2) {
    serviceActions.methodName = subjectParts[2] as ServiceMethods
  }
  if (subjectParts.length > 3) {
    serviceActions.servicePath = subjectParts.slice(3).join("/")
  }
  return serviceActions
}

const makeNatsPubSubjectName = function (serviceActions: ServiceActions) {
  let newServicename = serviceActions.servicePath

  if (serviceActions.servicePath.startsWith("/")) {
    newServicename = serviceActions.servicePath.replace("/", "")
  }
  newServicename = sanitizeServiceName(newServicename)
  let newServerName = sanitizeAppName(serviceActions.serverName)
  const subject = `${serviceActions.serviceType}.${newServerName}`
  return subject
}

const makeNatsSubjectName = function (serviceActions: ServiceActions) {
  let newServicename = serviceActions.servicePath

  if (serviceActions.servicePath.startsWith("/")) {
    newServicename = serviceActions.servicePath.replace("/", "")
  }
  newServicename = sanitizeServiceName(newServicename)
  let newServerName = sanitizeAppName(serviceActions.serverName)
  const subject = `${serviceActions.serviceType}.${newServerName}.${serviceActions.methodName}.${newServicename}`
  return subject
}

const makeNatsQueueOption = function (serviceActions: ServiceActions): string {
  let newServerName = sanitizeAppName(serviceActions.serverName)
  const queue: string = `${serviceActions.serviceType}.${newServerName}.${serviceActions.methodName}.>`
  return queue
}
const sanitizeServiceName = function (serviceName: string): string {
  const newServiceName: string = serviceName.replace(/\//g, ".") || "" // Convert to NATS segments
  return newServiceName
}

export {
  sanitizeAppName,
  getServiceName,
  sanitizeServiceName,
  makeNatsSubjectName,
  makeNatsPubSubjectName,
  makeNatsQueueOption,
}

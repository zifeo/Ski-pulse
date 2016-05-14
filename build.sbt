name := "Ski-pulse"

version := "1.0"

scalaVersion := "2.11.8"

scalaVersion := "2.11.8"
scalacOptions ++= Seq(
  "-deprecation",
  "-feature",
  "-unchecked",
  "-Xfatal-warnings",
  "-Xlint:_"
)

libraryDependencies ++= Seq(
  "com.typesafe" % "config" % "1.3.0",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.4.0",
  "ch.qos.logback" % "logback-classic" % "1.1.7",
  "net.debasishg" %% "redisclient" % "3.1",
  "com.github.nscala-time" %% "nscala-time" % "2.12.0",
  "com.typesafe.akka" %% "akka-slf4j" % "2.4.4",
  "com.typesafe.akka" %% "akka-http-experimental" % "2.4.4",
  "com.typesafe.akka" %% "akka-http-spray-json-experimental" % "2.4.4",
  "com.typesafe.akka" %% "akka-http-testkit-experimental" % "2.4.2-RC3" % "test",
  "org.scalacheck" %% "scalacheck" % "1.13.1" % "test",
  "org.scalatest" %% "scalatest" % "3.0.0-M16-SNAP4" % "test"
)

scalacOptions in (Compile, doc) ++= Seq(
  "-groups",
  "-implicits",
  "-no-link-warnings"
)

javacOptions in (Compile, doc) ++= Seq(
  "-notimestamp",
  "-linksource"
)

cancelable in Global := true
fork := true
autoAPIMappings := true
parallelExecution in Test := false

unmanagedClasspath in Compile += baseDirectory.value / "src" / "main" / "resources"

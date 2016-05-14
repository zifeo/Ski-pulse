package skipulse

import akka.actor.ActorSystem
import akka.event.Logging
import akka.http.scaladsl.Http
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server._
import akka.stream.ActorMaterializer
import spray.json._

import scala.language.implicitConversions

object Main extends App {

  implicit val sys = ActorSystem("skipulse")
  implicit val mat = ActorMaterializer()
  implicit val ec = sys.dispatcher

  import Directives._
  import SprayJsonSupport._
  import DefaultJsonProtocol._

  val routes =
    get {
      path("hello" / Segment) { name =>
        complete {
          s"hello$name"
        }
      } ~
        pathSingleSlash {
          getFromFile("static/index.html")
        } ~
        getFromDirectory("static")
    }

  val bind = Http().bindAndHandle(
    logRequestResult("ski-pulse", Logging.InfoLevel)(routes),
    config.getString("http.interface"),
    config.getInt("http.port")
  )

}
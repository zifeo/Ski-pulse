package skipulse

import akka.actor.ActorSystem
import akka.event.Logging
import akka.http.scaladsl.Http
import akka.http.scaladsl.server._
import akka.stream.ActorMaterializer

object Main extends App {

  implicit val sys = ActorSystem("skipulse")
  implicit val mat = ActorMaterializer()
  implicit val ec = sys.dispatcher

  import Directives._

  val routes =
    get {
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

  sys.log.info(s"Now visit {}:{} in your browser", config.getString("http.interface"), config.getInt("http.port"))

}
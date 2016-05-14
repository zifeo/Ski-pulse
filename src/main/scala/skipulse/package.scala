import java.time.Instant
import java.util.Date
import java.util.logging.LogManager

import com.typesafe.config.ConfigFactory
import spray.json._

import scala.language.implicitConversions

package object skipulse {

  import DefaultJsonProtocol._

  LogManager.getLogManager.readConfiguration()
  val config = ConfigFactory.load()

  implicit def toJson[T: JsonWriter](obj: T): JsValue =
    obj.toJson

  implicit object DateTimeFormat extends RootJsonFormat[Date] {
    def write(obj: Date): JsValue = {
      obj.toInstant.toEpochMilli.toJson
    }

    def read(json: JsValue): Date = json match {
      case JsNumber(s) => Date.from(Instant.ofEpochMilli(s.toLong))
      case x => serializationError(s"unknown type: $x")
    }
  }

}

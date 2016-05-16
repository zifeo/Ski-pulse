import java.util.logging.LogManager

import com.typesafe.config.ConfigFactory
import spray.json._

import scala.language.implicitConversions

package object skipulse {

  LogManager.getLogManager.readConfiguration()
  val config = ConfigFactory.load()

  implicit def toJson[T: JsonWriter](obj: T): JsValue =
    obj.toJson

}

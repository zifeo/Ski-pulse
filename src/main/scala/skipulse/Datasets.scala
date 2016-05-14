package skipulse

import java.io.File

import scala.io.{Codec, Source}

object Datasets extends App {

  def source(name: String): List[String] =
    Source.fromFile(s"./datasets/$name")(Codec.ISO8859).getLines().toList

  val model = source("model.csv")

  val ticketing = new File("./datasets/ticketing").list().map { station =>
    station.takeWhile(_ != '.') -> source(s"ticketing/$station")
  }


}

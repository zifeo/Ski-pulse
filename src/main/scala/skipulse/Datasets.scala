package skipulse

import java.io.File

import org.joda.time._
import org.joda.time.format.DateTimeFormat

import scala.io.{Codec, Source}

case class ModelData(station: String, date: DateTime, skier: Int)
case class TicketingData(station: String, date: DateTime, count: Int)

object Datasets extends App {

  val folder = "datasets"
  val datetimeF = DateTimeFormat.forPattern("dd.MM.yy HH:mm:ss")

  def source(name: String): List[String] =
    Source.fromFile(s"./$folder/$name")(Codec.ISO8859).getLines().toList

  val model = for {
    line <- source("model.csv").drop(1)
  } yield
    line.split(';') match {
      case Array(_, _, station, datetime, skier) =>
        ModelData(station, DateTime.parse(datetime, datetimeF), skier.toInt)
    }

  val ticketing = for {
    station <- new File(s"./$folder/ticketing").list().toList
    line <- source(s"ticketing/$station").drop(1)
  } yield {
    val station = line.takeWhile(_ != '.')
    line.split(';') match {
      case Array(date, hour, count) =>
        TicketingData(station, DateTime.parse(s"$date $hour", datetimeF), count.filter(_ != '\'').toDouble.toInt)
    }
  }

  println(model.take(10))

  println(ticketing.take(10))


}

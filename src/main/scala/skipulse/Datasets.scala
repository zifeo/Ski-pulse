package skipulse

import java.io.File

import com.github.nscala_time.time.OrderingImplicits._
import org.joda.time._
import org.joda.time.format.DateTimeFormat
import spray.json._

import scala.io.{Codec, Source}

case class ModelData(station: String, date: DateTime, skier: Int)
case class TicketingData(station: String, date: DateTime, count: Int)

object Datasets extends App {

  import DefaultJsonProtocol._

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
    line.split(';') match {
      case Array(date, hour, count) =>
        TicketingData(
          station.takeWhile(_ != '.'),
          DateTime.parse(s"$date $hour", datetimeF),
          count.filter(_ != '\'').toDouble.toInt
        )
    }
  }

  //println(model.take(10))

  //println(ticketing.take(10))

  //println(ticketing.map(_.station).distinct)

  val date = new DateTime(2016, 1, 3, 0, 0, 0)

  def inter(l: List[TicketingData]): List[TicketingData] =  {

    val arr = l.toArray

    val b = arr.map(_.count).takeWhile(_ == -1).length
    for (i <- 0 until b) arr(i) = arr(i).copy(count = 0)

    val a = arr.map(_.count).reverse.takeWhile(_ == -1).length
    val max = l.map(_.count).max
    for (i <- arr.length - a until arr.length) arr(i) = arr(i).copy(count = max)

    arr
      .zipWithIndex
      .foreach {
        case (t@TicketingData(_, _, -1), i) =>

          val prev =
            if (i == 0) 0
            else arr(i - 1).count

          val (next, dist) =
            if (i == arr.length - 1) (max, 1)
            else {
              val n = arr.map(_.count).drop(i).takeWhile(_ == -1).length
              (arr(i + n).count, n + 1)
            }

          val newCount = prev + (next - prev) / dist
          arr(i) = t.copy(count = newCount)

        case _ =>
      }

      arr.toList
  }

  def diff(l: List[TicketingData]): List[TicketingData] = l match {
    case Nil => Nil
    case head :: _ =>
      val tail = l
        .sliding(2)
        .map { case List(prev, curr) =>
          curr.copy(count = curr.count - prev.count)
        }
        .toList

      head :: tail
  }

  val output =
    ticketing
      .groupBy(_.station)
      .map { case (station, eps) =>

        val entries =
          eps
            .filter(_.date.getDayOfYear == date.getDayOfYear)
        assert(entries.size == 90)

        val counts =
          diff(inter(entries))
            .map(_.count)

        assert(counts.min >= 0)

        JsObject(
          "station" -> station,
          "start" -> entries.minBy(_.date).date.toString,
          "end" -> entries.maxBy(_.date).date.toString,
          "entries" -> counts.toJson
        )
      }

  println(
    JsObject(
      "day" -> date.toString,
      "data" -> output.toJson

    ).prettyPrint)

}

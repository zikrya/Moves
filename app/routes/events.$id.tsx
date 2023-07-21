import type { Price } from "@prisma/client";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { json } from "@remix-run/server-runtime";
import { useOptionalUser } from "~/utils";
import { prisma } from "../db.server";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

type PriceWithCount = SerializeFrom<Price & { _count: { tickets: number } }>;

export const loader = async ({ params }: LoaderArgs) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      prices: {
        include: {
          _count: true,
        },
      },
      user: true,
    },
  });
  return json(event);
};

const isSoldOut = (price: PriceWithCount) =>
  price.quantity ? price._count.tickets >= price.quantity : false;


export default function Event() {
  const user = useOptionalUser();
  const event = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const formattedStartsAt = new Date(event.startsAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const formattedEndsAt = new Date(event.endsAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const [showMap, setShowMap] = useState(false);

  const containerStyle = {
    width: '400px',
    height: '300px'
  };

  const [locationCoords, setLocationCoords] = useState({ lat: -3.745, lng: -38.523 });

  const mapComponent = showMap && (
    <LoadScript googleMapsApiKey="AIzaSyBNV00YlZJ-fKzCj8RP_8wBBYajgxrSjYA">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={locationCoords}
        zoom={10}
      >
        <Marker position={locationCoords} />
      </GoogleMap>
    </LoadScript>
  );

  const geocodeLocation = async (location: string) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyBNV00YlZJ-fKzCj8RP_8wBBYajgxrSjYA`);
      const data = await response.json();

      if (data.results && data.results[0]) {
        setLocationCoords(data.results[0].geometry.location);
      } else {
        console.error("Failed to geocode location");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  }

  useEffect(() => {
    if (event.location) {
      geocodeLocation(event.location);
    }
  }, [event.location]);

  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleCheckout = (price: PriceWithCount) => {
    if (!isSoldOut(price)) {
      fetcher.submit(
        { priceId: price.id },
        {
          method: "POST",
          action: "/api/checkout",
        }
      );
    }
  };

  return (
    <>
    <div className="blurred-background"
        style={{ backgroundImage: `url(${"data:image/jpeg;base64,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"})` }}></div>
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
    {user?.id === event.userId && (
              <Link
                to={`/events/${event.id}/edit`}
                className="your-component-btn flex w-full sm:w-auto items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-purple-600 0 mt-4 sm:mt-0 underline"
              >
                Edit Event
              </Link>
            )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 your-component-container">
        <div className="lg:order-2">
          <h1 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-white sm:text-4xl your-component-title">
            {event.title}
          </h1>
          <p className="mt-2 text-lg text-white your-component-date">{formattedStartsAt}</p>

          <div className="border-t-2 border-purple-600 mt-4 pt-4">
            <p className="text-white">{event.refund}</p>
          </div>

          <div className="items-center sm:flex-row">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="inline-block align-bottom bg-black rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
     style={{ boxShadow: "0 0 60px rgba(128, 58, 217, 0.5)" }}>
              {event.prices &&
                event.prices.map((price) => (
                  <div key={price.id}>
                    <p className="mt-2 text-sm text-white">
                      <span className="font-medium">Ticket Type: </span>
                      {price.name}
                    </p>
                    <p className="mt-2 text-sm text-white">
                      <span className="font-medium">Price: </span>${price.price}
                    </p>
                    <button
                      onClick={() => handleCheckout(price)}
                      disabled={isSoldOut(price)}
                      className={`flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium ${
                        isSoldOut(price)
                          ? "bg-gray-400 text-white"
                          : fetcher.state === "submitting"
                          ? "bg-purple-600"
                          : "bg-purple-600 text-white hover:bg-purple-400"
                      }`}
                    >
                      {isSoldOut(price)
                        ? "Sold Out"
                        : fetcher.state === "submitting"
                        ? "Processing..."
                        : "Buy Ticket"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
          </div>
        </div>

        <div className="lg:order-1">
        <img
              src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBUUFBgVFRQYGRgaGxodGhobGhobGBgZGRobGhsYGhsdIC0kGyApIBgaJjclKS4wNDQ0GiM5PzkyPi0yNDABCwsLEA8QHRISHjUpIysyNTIyMjIyNTIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIALcBEwMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAFBgAEAgMHAf/EAD8QAAIBAgQEBQEFBwMEAgMBAAECEQADBBIhMQUGQVETImFxgZEyQqGxwQcUI1Ji4fBy0fEkgpLCM7JDRKIW/8QAGQEAAwEBAQAAAAAAAAAAAAAAAgMEAQAF/8QAJREAAgICAgICAwADAAAAAAAAAAECEQMhEjEiQQQTMlFhcYGR/9oADAMBAAIRAxEAPwDmN62UZlbdSQfcGD+VYCoa9WnIF/whFRayisRRGFnDHWiDbUOw51omE0p+PoTPs1OtUyNauzVa4utdJBJlzhz+ajFi6VJG4PTpQPBmGFHHXY0+K8UJl2WMgOo/uK1lJ0rPDGraW5O1aLFnE2jJjaqyrvXUOE8l/vCFyyqJIAIJM/pShxvhLYZ2R4zAxp9ZH4UtSjKVJ7GbStoA2x1q7d1War2Vrbbf7tOSo5lvhV7XKau43CAeYiT0FDEXI2benTgmHW+V8pPYDWT0/wA9KxugfehZsqWJBEmP8EVew/DWy58yL/rYKP70xXOCJhnPiQzsC4RTsOxNL2M/d7zaNdVugKhlHtl2rLT3Ho3jXfZbwfCLZuLnxdsliICgtue/SmPinAbNsql03GJ+yEGja+lK3Dxh7VwC4zPBEBPLA9STvTvjeZrRRT4GfKPLmbUaD0Pak5OfJVbCi407oBY/h2EtghEtNcAnLcZzHvAOtCrL37kpkRF2IRABB9SJonZ5suqG8O3aTMZ0WSPkn8xQ58feuvmuXGM+yj6CBRxjLfJATnH0dN5dLeCqNugAHtGlKXF8KqYkPnRGzHzuucL6he9H+VrvTuPyqjzTgsznTfUVNDxyNfsbLcE0Asd+6Mc2Ix168w6KmVfhSMo+Ir29zDgreGbDph7ly2zZirsFzGQ26yQJAoHxHBkCdB80PxGGAWCwqn6YtK2xX2u+gJj+I2nuSuFRFB+yHY6diYE/SpiOIm6Mhcog2RRCD4G/zVbEWVBOpNV8wHSudp7DW0XLKEKyBgQ2UwDvlmNPmtWItFRuRVzhfmJ0EVjxWRvTHFcTFLYFuNWFWcUEzeQkiBqRBmNfxmqpEVBJbKIs8ipUqUIVkNeqa8NQVwRsArw1mNqxcUVaAMrR1oraby0JSiVg6U3Gxc0eCtNytrnWtbjSibORuwm9MKpKUs4V4YU14JgViqI7ihMuzRhGo1hUkigSDK5HrTJwlJIrJAHQ+XhksE9pP0ArmnN6ZrhY6k9a6fg1y4U+x/2rnXMaZpqXB+bY/LqKEtkiqj3Iait23oRQW/vVk9IVHYXwbZgfUUzctcSeycimCfvRJj07Um4K9G5pk4QwDBoMe9Cla2ddMY+KJmIuSc25bqfc0qYlzLBQEk6mdT/tTXxAZreYbflSljMLuRWwXjR03srLYG+cA0xWirWwZJ0pYyx1pg4ewNsUVAXsmGNvygJrJkkzOvaidqwC32QPagWEWHJ9aZ7MMoI3rJqjIuw/wFsrqOk0T5jsyobtS7wi4Q4k9acuIW8yGoMnjNMrx+UGjk/G0g/5rVVEzqJFFeO2/MR2rVgEBT1q6MvEkryEniFnKx96Fus0x8bsec0Is4UlvSilHkHF0XuCJlBBFa+KHMwX1ohh7MIT16UHv3P4mvfX60TXibHbBuITKfk1XaiXEbcOw9aHOKhyRplEGa4qVKlJDPTXgr015WBm60azddK1WzVpVkU6G0LeiqtX8O2lUYg1bw9dDTMkbLlSpcrxTR+wTC0PMPembASNaC8LwLX7yWkjM7ACTAn1+ldGTkXFIunht7NE/UCmLLCOpPZjxyltCwVlqZOC24IoHicM9tstxGUg6yP12PxTTywgdlHqK2clxtdClFqVNDxiFy4cj+kVzrigzNFdI4wYst7VzbEtL1N8b2xmf0hX4mmWaAOPxpn5hWBSuxqyT0hUDy20UzcHeF1pZC6ijuHuZAJrYLR0hxwl0XLYHoZFBri7qe9ZcFxSk6dj8mtWOu5WBPWtSpsxvQKxeHKmjPAbZdCvrWKqLix1q9y9hClwgn1Fa+mCltAvEWzbdhtrRngWKzHKTQ3mZQLhiZiqfDcRkYECua5IF+LH1beVgadUOZB6j9KSsPcDoGFOWBMovtXm510W4v4IfH8PFw6b/mNDQrhhMsIpq5tw5AJHTX66Gk7hTk3CCdxVeJ8oE+RcZgrjoPiEd68t4HLbkkVd4xg819T0jWtXFb4VMgmTVEXpC/bKGB86tr1NLmOb+IfenLAYXLYLQetK2G4bcxDsLarod2dEHwXIHr8UOWSSbGwTdGnGklyT1g/hQ+6KaMVwR2hUcXHQAMLaXbgJ7qUtEZemYmDr0pcxEKSrhgR0yjpI79x+dSTyQldMeoSj2irFSvMwqUjQdMkV4ahNYg1gZtCGJgx36VastIrVbukKV6Eho7kAgfmazwzeYimYnugJrVmN9YM1nYat2Jt6TVe1TJRqQC2iy9YrXpr1BRHI2WTDAjQyI7gjrNdL4HzLfW2MzlxH3iSf/Lf6zXNhTbwwfwwfStlijODtFGKVPY4WuYrFxSLlsjvoGX/f8KK8EsYVnD2DrrmUAhQPYjSuaYd/NHrXR+SsPltlu5/Kon8VYrcW1/L0My5FKlQd460WWrnLjzmugcyNGHb4pCsEMpPWqPjLxZDm7SFvmBpgUrsutNtzht3EXjbtpmPfZR6k9KN8Z4JgsDYT95Ga685TbzKSYGaYB8uw1U707LljGkwcWKUtnPcNbk+1WMRejSiWENm7PhZ1aT5XIbMDqCCACTodImgeMbzkdtKbDInG0DODUqYW4dfIWRuCaL4qLlkP1GtL2BeAPXN+VGeXLudWtn4ovQDWzXw+9qKdOHoHIjeKTLOH8N2DdCYo9yvjv4+XpFdNeNo6D8jzjnCrjXJCgyKpWeEXAfuiug8QtTBFL2L4hZtkh3Gb+VZZh7gbVOszoZLCrLPBMO4AVjTvw/7EdqU+C3VuILqyEDZSx019vmmvAnQ1NmlyHwjx0VOO4cOmokbH2NI2FwCJeGnpXRsYmZCKU0wga8CTA3NFgnSaByQtpmOOwaABiopPxIUuTA9KdeZ/LbAFIl4EmqcTdWKyqmBuYuPvkFlPKo3I0O+0/j8x3oNy/wAHuYq6qqDlmWbaFBEwTpOulM3NnLZFv94Q7hSyxpMQTM9YB9we+jjwvgVvC4VGusUGRQVQFmnLJWFkk9TUedtO2WYYpi9zJYypatYUMnhmdCssx3LMqgsSd5Os0lcw3rlxg11QGEjMOo0hGMknL0JMwY6CmLi/H7dzyWw6a/eAE9RsT+NKXEFYEmftb679fpSIRodkarRQiva2fuznpUpojiyG0wgEEfG9O/LWFwaW/wDqLed3+yqobjkjsoG3rSpadgf4bhZOiE9/fy/WmDgX7uXK4rxUdRp4ZAkyNdQdNTtIoZMbBbM+N8Jw1y2LmDDo/iZGsMDOYydJMoYB01GnSlK08EGuscTxNjB2h+6i3eR8xuNffV3kAEGB4hH8o1ErFc541hlUq4ttbLTmQhgFbQygfzZSO8/QiNxT/RmSGrLCpmX3FDMsGKI8Mu+XXUjQAakk7ADqao33BbNGWe9XZHFpEsUzYteqaxjSeleIdaXZqRZWmvhGtsUqW6beBf8AxfWqYfi/9HJ7RUwutyPWuw8DsZLSD0muS8HTPfCgfe/WuyWBCgdgBUvyn6Djsqc1tGHaudoxJS2hUPcJC5mCqAAWZ2PYAH32p/5xaMO3x+dIaYANcS6VzG2jBFIkZ3KqjH/TJb4FBjnwxOSBcOWRIZuXWXDhUdlLsxkqNCZAkTrtG/atPFMXbvXncsmW35JaIGsn/PSgPF1e3dUqczqpAA2BgkMx6SxmO3xWjDcI/wCjuF7qeNdcOqhgYQKRPfXUz6TXnrlNtyfZ6MYxh0v4e868MFhreItqgAObOmumkMfT1pa5rwABTEWx5LokgbK/3gPQ7j3qzb4Fi4Ia2q2oMuHDI0jTKAJk17wDGi7hnwrAF7eqA65sh2HrlED2FV4pcZLehGaNx62BOHjy/X8qtct3it5T0nX2ohbwq3FV7cAGZHY5dqG8OTwwWO9etGJ5c3oaOb7eTK6/eFUuUrn8cexojecYvBE7sn6Vp5L4Ffe4twWyE1GZtAZEggHVh6ilykoxaZqXKSaHPmG64tKLZILkKSNwDvl9TsPeg/EuXLduwb1zrBKCSSdBrBBdidTTRdWEQn7sH2q/fFq9b0yuqmD2BHSvNnLqj0IaVM5Pg+J4y3mfDDJbnVMoIP8AqHf2roHI3HzjLbsyqrowVgux00Ydp7elURYtFiq5lCEuAoksACpG2u9V+Q8NctYi9nQr4gD67Zgxke/n/ChbTsKcGlY/7yKAYm2ELGveOWMTfEYW+LYBIdisyRuFPoZB9ornfGLNzCMxxF27cuGcrbID6dv7VmOasBwtDpxhM1mfalLJrEUH4JzldR/BxD57TkAM32kJOhnqveffpBZ8Rh4Ye9W45aJckXZa5pWMGV7rQ3lfH4bD4ILjL0hy1xQXYMiQqqgynNBC5vXNtpRbmwTaVP6T+VcdvI9y4R1C6adFAA9tABNLzRUoK/2NxyqT/wAHQuccVhFYvbtr4hCg5spIESDInXXeT76VzbH4rOfQVLzOJDb/AOf581TJpCikOlNvQV8ROv6f7VK0WxoKlZR3JmxHyjyXEU9ftyfc5dfyolZxBS2HKiGYgMFDWLhUAlSIm24kHSJnUdSJTBXRb8Q22yZsociFLHoCd9tY2kTuKxsX2UMoYhTGYA+Vo2kbGJNc0dGVD1y7zBYDJbxaF0thvCdRL2mYy2U7wYG3YVR5w/dXtC5be9nLSBcIOaDlOUTIGVpnpAHWgmEw5Zgehqpxm8WvODspyqOwXT85PzQQVS0HKXi7NeAx72bguWzDrOVuqMRGcf1CTFMnJmAtXXe5fCuFgAO2knUkj71KNHuX/BtkXbjMzq2lsL5YGpZj1HpTJPQONK1ZY5ks2UuTYdWRjDKslUbplJ+dqCrvTPxfGYV8PcTD4cJmKtnk5vK0gEGcvXaly/8AakdQD9RTMbvRmaFOzdbNOHLazbak22ac+UmlHFehj/Fkz7Rc5Mw2bEz2JNdRtnb1b8qSOR8ND3H7E07WTGSTGhJ+ah+S7mw8a0Dublm1Hcr+dL1m+yW8kbOtwHqMkSD6aD8aZ+MW/FACsMoMs24VV1J03oSWtEOiEaAz3HQs57+lInkisfF9jsUblyOa8wObt43Lc/xNMpJAzT5knpJ/T0qrftiVZ7ii5pNsWNAVAj7DlgZ0kgHY1OK43w7+QQfPmynce/YnTT0o1iOZbVz/APVRCOq/a+T1pUJNJaKtS9lDhd24AfE8qxOWdB1Pt/elKzfZLyujQcwYEepozxjiJZGjy5vKB7/2oLgMMz3EVRqSAPQ7A/EE/FGlpsXlldRXo6Pw7AyDcEZLjBiP5SyAkfUk/NAOacKbNzIPsnUH0p84PgosG22g8QZfZbagf/WlOxdXG27lhz/ERnyMeoViP0r08M3xpnnZYrloG8v8dGFnPbZ0foIjfWSfyrs9x/4YKQBlBU7CI0j0jahHEkwYwq4YvbTMiRp0fRXGnU9a8CYVMOuHuM2JRAoVXVTquq7xtoBO0CocmR5GPjFY0ecG4l+84d/s5rbG2wAjVRMmepmaz4jzGyLbQWmZzcRQq6h0jzMWgBTodD2pW/Z/i0GKxtlFKo4FxFO6gEgjf+sdelFsdxNbV22ilS7nRSdY1G3SdRPvWvHao7nTsJYzhj22/efEifspH2Qdh60Bx/H8RYR2a5nUDyrCjK0EbgeoopzBxZzbLaQN1Gw7n1pO4rih+53RcEk+S0P63JMnvlGsegoJRUYO0bCbnPsfOIc0DDph8qkW2XzuyXGNsLC6oomS2mpHfWl3mTEnG2DcE+E0hWKlJyn7QB1361nwPj1q3FqU8C1aRFuPLC4RsCoSASQTv12odzxjLtwBdEQawNBU9pUiyGOr/wAHOGRyDm2Bj1/4rqPJmLOJw6SZdG8NtdTljK3yI+hrnlmWygAKtwi3nkSYbMRG+pgT6xTB+zpimKKdGgfIkj8ARVkG0yOcU+h85qQ5gI0Cn8RXG8a4Vj31E/Ndu402e4ynp/tXOeH8u27pxD4hilu3m84IEGe50+KoS5QoQ3UrEu9iQwAjadepnv8AjWq0k61dU2l8RVUvmWEdtMkMDmA6kgR0iTVUOV0IqWUWhydm6pW5bS/evqp6rvHptXtdwZ3JHQ+I4I/uTZbanyBHuXPMUJEhLa/cVdIO/XeuYWyNzXQOa+PM1u4ogI5mBsCdBH+dK53OtS/H5U3IozUmkhswGVMMt8GQpdbg/lcElB7MpX5n0pTZiTJMk6k9z1p15YS2bDJcVclxijkifKUkGQfKVcK2boRPYhQx+Fa1de20EoYJEEfUaT3jrNUKNCpSvRoO9XcMSBLW2K94OnqDEUV5c4MLqNdf7KsqKO7lWaT6BVJPxXX8FirBufuqKgS2hkgDzMIB+NTSZ5UpUHjg6s47jceptLaRTqwLMxljl2XsBNUH1bT0H00p65z5YGGxAcJNm5sV0yNMNAHxptrSVjsI1q4VMkbqwGjKdj/nWqcTXZmW3s6LwDka1cwIvOx8S4uZSWKokyE0A1+6T9Krcr4G5auXbV1YdYnqPQg9QaYOGcbS3gMPaeUYW0nOjqh7HORl1069aFITi7rlD9iEUhoTSSSQR5wSx020kxXYvkyjyvo76FKvQ18Cw3h23kQSxrzj+OyXMsjKqgR3MT/tWrlolbKWmnNbcq2aZIXzAkkmdI60D5lx+ck9yAPUSaZiXOdknyXwVBnD4xk2bysDI7g7ikbF404a++Gdytu7aVVuA+ZGzEpcmdDI17zTfyzbW5bV7hgabzr80sftVwSK9togODr1IWOnsdB2X1qf5UoOaiux3xeSg2+mI2GwrJiGt3PtqWzdRpBkHqDM/NEr9kkZwNJj3rXgMLcvXDeKwH8g+Aqj30ETTTd4TlVFYGPwpbltFmOHixHxSkxAmP0oxhMi3LV22MyqWNxR9tC4AKx6Ab9z2pjv2LVpC9whVG5P5AdT6UicU4n4lybYyID5Y0f/AFFhrPpsKNb6FziobbOw4bFAqvmBUsCjDYysCuXYnxcLiixBDB2YdmBYn9aM8r8U8qW3uZ1dokCGt3IkBl6htYYbwdjvtwLLiGezifuu3hv1mTpVvx3ytPtEeVdSXQxY7j3iWQ720LpJtl0HkBEAqSTOnatuFwZuYC27l2uO7ajZhJy5hp5QsbGTS4uHxL4q1gyqsNQpYCDbgywPWBrTRxYHA4S1b8QuyMygRGcEjQ9gsn6Cp3Bwnxv+j8kozhaXQucNS5huLW5TS4jpCqiyMuY+VCQNVB/4onaxTG8b1wZSuZRAGwncHUjf5NFeXrtm5cV3IzsB4epBPmBZew+zHr7VT524zZaHABUi4mYb50Zkg/KnXt70zl5UTU3GwD+0LilsG3bsPMqtx+kGfIp+dfgUFw2KV7aNdlgLmdt/u9ATuToI/qpcu3jcuZmlpOvqO3pTRxvhz2bNq0SS0+IFhgrKyiCJAMjWlT/Gh+PTs84BxrDpbP7w1xntuSiKxFsgkEFoBmGLadoqxjeKjF/ZEZp+KT3Qq4kagr5TsddjGpn9aY0wtrBOA5a85EsiOi20b+UlMzEj3FTzgnsrxZX1WgbxLB3bbrb8PzKim2VBnLmLB9NyYPprtNWeE8VW1ikut5dYcbFW/mj31jtNG05xuKxuW8PbUkAM3mZiBsuYzA9BXljmm/cuRas2i7b5FAZoEksx9B1NbHK9WgPqXpmvjXNL3MQzW7hyk+WOoigfM+ObxTZd4W3ErMBrhAZ2YdTLRJ2C0/8ADuL3XDG7atW8sau6MzN0hRJPufSrjcw2wCciBzvcFtZb/VIE+9Ol8u40kJXxWndnIsVeR0HhpCW1850JLM32mcd4UKNIg76k+4/A3LZZC05GIkaqY0lT2jWn7mPmtLhCIi/1MVXUjbTbSsuD8/3LZyX4u29oAUMvt0PtQfa66CeKvZy/L6VK6pf43gmYlLV3Kdvs/PXvUpf3S/TN+lfsUObk8K54QJK6OpO5Rh5QfUHMp9Vml62Na243Em47O27GeunYCeg2+K8wy02kuhdt9jxy/bzWlQjTw3JHcHXr6D8aWuYy6YhthnCPoBBJUByPdw9NPKji3ctqxkFSrT/WgMf+NyP+yl/mtMwt3YiS6mdwJDqCP+56ZJWgE6egjwq+EwyBbks73GZdJWEsqCY7nxI9Ks8ExzeIWnzA60D4IyMApOyjXXufKR6frW7EnwrisNFbQ/pUkoK2i2MmopnUsRffEWTbOrSpQ6SrTHXQiCdPQUscR4LeuW0EQXuFHCiAjZgr+wMZx6NW3gfEi5CAyenxT1wy1mV7jwskZtvMyiMx+IrIzcVQUoqr9MWeccaLWHKKYLZUUehIBH0BoVytwW1duOl6SqAHKNizbgnpsNu1XeKPbuZ75BbI38FfulgpBYjrDHT2ohy3aFtrdpjFwjxLg6ywhAT7SY9aZj8lx/2zJvim/wDha4/j0wdsZUOUQiqomAdPwApV5ixyG2Lls5pZQQPtLruR0NEuf76KyIzABiWMnykLpB0/q/CqF3hmERU8MLndgudLkIoyly+kyYBEab16MHHHDkeTki8k+JlZe5/CspcW3pmaRmYQIzAEgL11PaNdjW50tpce0GuO7m2ZL/cCQWYjQKGK5dh9obddnON21h1W6kwxyooBXPkA87k6kCRv30g60lYni1xkcsfPcGUDshEEn0ykgD+ot0FeSrzZHM9J8ccFH9GGD5jvW1CoEgGRmUkjUn+b1rbi+bsZcibuUDoqIB+IJ/GgZNY1WoRXon+yVVZvxOLuXDNy4znpmYmPYHb4rTWM1JrQezOxeZDKkg6ajcEEMCPUEA/FNw4jh7llWbxFdh5wsQGGhj3gH5FJtEOD3kV2FxcwKkqCSBnGomPSfwpuObiwZq0dW5XZlGEuMWKF3CFwM+UDLJP8up13MCiXMiLibDlTmykupG5Gsx8T9KWbvNVpLeGyjMlkW1urlIOd0ZGGogGUnQwZFMXDOLYS6f8ApCQiwGUqy5WYnYN0Ou2lT/InJSUh+CMZRcTmLY4JngmVUhSukOSIM9YAH0oXiLzm3DM0ZiQvSTufeug858qXXxg8Kwzoyq/kGmZQQQzaBZ96FY3kbHOpe41pFXVUa4fKP5RlUqI96P7otWwPqa62KHDUBcT3FOeLxIv4pDduKqIozmJyooJIBB1J0AHUtQLhXBbzOYtnysAxP2VjqTtUujw7zi559NNYXP8AdZt8wGulNf4AR/LZ5zfhVW6LlvKFvKLgtrJNvONFY7Zjqd++gkUa5f4CVum7dlFwyZnJ7uCV+cpJ9qM8I5Yw9xbbXM7XQFuNlb+EudcyZpMliMpMDcAHSZEcb40f3e4i/wD5rsz1ZLVq0hJ/7gR/5V5v234o9DFi5Ozo+ExbvhQ6rAK7fpXHeO4pxfdtjqNBEg6Haup8NxTJw/DOdnCk+gO4/GaQ/wBpHCDh78/ccZlP5j/O9djl5Uwcmk2hewOLNxyjHLI8pA6qNj9KtceuXLYULdDgqhYgRlLqSF37qw+lBML/APImgOux0B6b9KucXcFkzrl8pBKHMSJkaEgGDPUb1dGEHFv2SSySurKtvEDI5cSxjKZiCN9OtGeE8C/eMObyXQrI+R1ZdBOqMCDMHXodQaXQ4G2oExpGntTh+zvEwMVbnU21uDv/AA2MkfD10YxbpgSk0rFK7iMpI7afSpWN/wC03+pvzNSi4RN5s11ew4gSf+apJvVtn2/yPX8Z+KVFbCDOBuk6k/8AOv0+0fgjtW7mN82HTWYu7e6H+1VrByp6wNPc6D41+lO3L19Ftg5W2P3SxJJiYA/pinPoBdnN+FkKTmJUb7GT6CjJvo65Yt67Fi+YE9iVyg9fyq/zVcV76Eh0UBhmZGUZjljp6UMNtFu5RcVkhivnYK2khSwEAkiNh02pbikx0W6PeB8YaxczMJIBH966ZzBx63ibVpMOwU3GJbYZUCwzPB0j17Vyx7aq+jLm6AMGWdNC3zT5y1aZ8LeRbdpHIKyqqGYx94dulJeFSlobGdRt+gpbXDYa0MTcupcVdLCIwZWboSRuSZJ7fFYcnKbl177vme40nQgew9AIA9q56EuqxDXEUzrqv6Cugco3cqoDczEneqo4PrTdk7zc3TRW/aVbytZf+ZnU+wAI/M0IyouEW+hQuLgtsrFEAGVgpJgSSQPp1o9+1JItWW7XD/8A0h/2pY5Vu2fFdMRqmTOqkSpdDKkggjSe1LblPxvVdBeMY8q3fYH4zea6bvi3GzWE9cgdmX+Gk7EztpME9KB4RAy3GbdUkerMwA/M0Q5s4jcuX2DXM6TmUD7PmEmANJmR8UGR4BHePwM1kIcHQDlz2Yk15XhNStswlSpRHl6wlzEILhAUHNBBIYqMwTTuQK41K9A6vVaDNHuauEi0/iJAR2IyjUI2UNGnQy0f6TQCsTs2Sp0O+D5cfEW0driW7bhX3zMRrEjSD5j1o9hsFaw0C1cgxDXG8PWPQrLfUD1J0pS5e4ovhi09t3CElirEFbZYeaMp2Zo6brWWM4m6oHt4ZFDMQHYtc1AkqJIGbXtS5qcnsoxyxxV+x6xPMli3CPevOcp8wuFQCBpOUbnsPxoV/wD604pjato4cqfDYtAEdFQDTyg+ZmJ16GlLj2AuW0stcuB3uItxkChfDz6qrQIkrr/gnby4gVvFJiBp6tv+GlMhgTVMVP5Lu0GcFxBrc2rklCZKEkQ22Yeug94rRheHLexotlH8NpyhYJcIhI12AManpPeKMtgVxhCLmN3LOdUYpp912AIRvfQx33A4+zjMA4liuYwYbRlkEg9gQINKcpRuNjqjOpoO4fmy0ltgmYsztlLeXKgQJbTLJgdd9ADSbi7we4coORPKg/pBOpPdiWY+rGimL5buqUdo84zjwwbiAMDsyiCN9ugpexyeGY10ncQfodqRCC9FmGXG2zt1jCBuD2R/LaRh9J/Wua858wHE27Nt189rMC8/aBgAfhXUbbIOHplOq2UDDuAgFcK4u4Lt712NKUr/AESZH4v+tmvh9oNdAZcwIOmv18usjes+NKikIlspBaZbN1jtpttJjbpVbBAyTOw/UVlj7haCSSdpJJ6aCrFDXIkcvRTmjPKl50xKFGyk5lnoQylWB+CfpQWtlq6VIIMEVydMxrQS5jwb2cTctqsqCCD3DqH/APapVjDccCqA9pXYTLNqTrpPsIHxUpvKJgHCCZ/z/P8Aet+HSWA/z1/9vqK0gdf89P8A1qzhRAJ+ntp/b6Glo1hGSddOu/TtVvifF7+ZbKXMoC+aMu4LRqBp5QpgfzUMd4Vvb8ToPz/OqeC0b4b/AOpom+jkWLN9ltu5YsSVAkk6kN3qgLzfzGsyZUiYAg+7HQD6T+NaJrJbORta+53Yn5px5C4lkuKty45DMVC7rqBr6dqShRPhz5AGG4afpFHiXkdJ6GzmLA27OJYC2SGOYa6a1swfNtyyGtphbeZQWcliYtgA6aiYBnSSe1FuYLYxFixiUE7BvT/DQHDcCtXr4FzOc7DqAFEAaCNdqbmi5RpA45cZFp+breMPh4y3lQMrr4ZO6fcPWG1EjYxUx3FcEtxLiNqiKsIu+UmCxgawYNTmPkxcJnui+MgUFUW35joFiWubnv6mgl7h1s2mu5boRIzRkY6mO6gfjUfHi009lV8otNaNvOONwuItJdsqy3FaHDHdGBOmnRgP/I0oUbcYY23A8ZXKkpmVcrEbagk6xQSjp+xDcb8SGvK9rya4wlGOW7wt3GfY5YDb5ZZZaI10B09aDzVvhr+YjuPxH+Gtgk3s666DvFrniBrYfMukHLGo2P5ilhhBg6UcQ+YT3FUeKp55ps46sFSt7KuHxD2zmRiphlMdVcFWUjqCCRV7DcauW1KpkDEgi5l/iJGsI33QeulDKgNJDodeH4nE37Qzvh/M0+Jda2HYjywTJYAbRH4U1cA4RaURdupcYsTltSy6/wAzDUD4HvXMMBintg5GZZ3gkT9KtY3mHEto10nSJKrMEzAMSNq2Tk46ZsOHtHW+Lcy28NbHg5HYbIrAKqjckjYUNt8+pc8uKsoVOxADrHcHWfiuTXcfccAOxaNpYmPqays40rtME6jSD027+tJ+lV3sY8u+jqOPTAX3Z7eIu23aCTbuuFOWIGRpUAQNABEUH4jy3bvNn/fgTEEvbWT6koyyfWKS0xisdfL66x+EmrNkXGV3WWRCoZhsCxIUa9yKX9Ul0xscq/Q743iLWU8M3Ay5cpKk5T5Y26VzjHHzGO9XWumDM0NvGTW44KIOWbkX+B3QrsCqmV+8J2IqcUeV+yo1Gwg9aoYa7kdW7HX2Ohq7xU6fZiYIPcd6sg1waJJLyQKolh+HaB7hAUwYDD317adKG1lnMROlIGJpdjpZ4vgVUKMIpjqSST71KUreIAA/hqfWN6lL+pDfs/h4BPz/AJ/vVrNVey4gzWbmnxEMyxNzygdz+A/v+VarDQSf6T+VEbFkEDcntH5VjjoRSCsMRpKx1E1jew1DXYJNwxHrPzXgryoK4wzpj4Rw8G2Gf7xJAHbb9KWxRng3FntA2w0K53jVTtp2FMxOmZaXZ1HlFA9h7DDQarPrVTAPbF8LMlSdhtFCeVsa1u8rsxIJg69DR3E4Dw8Y7j7LLmHzvVDW3YH2fpHn7Rmm2hk5ZUtGpgf3ilW5xy2thrQh7bW1dlYEHPmAyT2gHWnrjWHDm0riVcZSO4IFJ37QOXUwwN22TFxgGUgQgiQBGkSO31mpsmO2h0MlRaFnmDjbYu4jFFRLa5LaKICqD+JoERW+vDb1jKZ0094gfiK6TsTBGmsSK32bYYhPsmYk7SYAB6KJnX11rF0KkhhqCQfcbiRQh0aorbYuFDI+fWf+K32LOdstvQsDAOkkbgH27xWDgZdV8ytDHpBmB26H4X6Z0dRfVpg9NK0cQfYetTC4psgtHUTK6aidxPx+dVcU8sfSnOdxAcdmu4NdK11mau4DDo4JMll1KnYr3Ht1B6a96S2Mir0asOpAkjQgwe8VrumTRy6gdCo3Gq+46UCub1qlaOlDizfjLVtQhtOzygL5ljK/VR3HrVWvZrGuBot8PsZ31MKAWYnZVG7H0pgdIwDsoyo963lBjMwVbkn13BjpQKzc8vhkZUBzXCPtPGymeg2C99T6Wb3EWuFFOiqCEWTlQtGgHsFE9dT1rJOosdhVzRXzkD7I96qXHLHWjJZBZuhh5ybeX4LZv0oIKTB3ei35cONK/RiRVhrxa3lJnJEe01oNYzTYujzpIxqVKtPw+4E8TLKwpLDULmEgE9D6VphVqVKlcabUOtbrepE+lSpXRBYcXiPht/DAGXbvptvQ7jfEGxFxrrxmbeBA2A2+KlSjkaCagqVKA0yFZqalSuQI28Exoe0QftIQCe4Ox99I+K6NYveNhEu/eAyn40qVKsW4oUu2WbluWsSdhP4UE/aMubB3G7Pbj/yj9alShfYT6ORGtuIIJIPXSdYJGp0G2g9dR61KlIkMh0Vygnyk7jSI3171tDMsSJAhipJynWNYM67d9alShOPbDZZOUHQQTPlYg6iD6fh9bVsrBzZvOs21QALmMBGOZtBIbsQQDqCQZUrkaV7jAOSrys+VoOwPlPQ7RuPivcbhMuqnMrQQToYInUd6lSh9mvoqEVnaZlIZdCNQalSiMC9m9oGGgPTsRuKqcQUGGVQN8xk6nvB27adqlSgXYyX4lS7YKhWOzAlfXKYPtrW7hl0rcGVUZvu51DAHeYOkiNJmpUo/Ys0O5JJJkkkk9SSZJPyTWa7fNe1KCQ7F7NzXCVJPaDVImpUoIjc8m6v9ErFq9qUZKyOg6GvMxiJ0r2pRGGFSpUrjj//Z"
              alt={event.title}
              className="object-cover rounded-lg w-full h-56 lg:h-auto"
            />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-6">
  <div className="flex">
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${event.location ? encodeURIComponent(event.location) : ''}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mr-4 text-purple-600"
    >
      {event.location}
    </a>
    <button
  onClick={() => {
    setShowMap(!showMap);
  }}
  className="mt-2 btn btn-primary text-purple-600"
>
  Show in Map
</button>
    {mapComponent}
    <div className="border-l border-purple-600 h-6 my-auto"></div>
    <p className="ml-4 text-white">
      {formattedStartsAt}
      <br />
      - {formattedEndsAt}
    </p>
  </div>
  <p className="mt-4 max-w-2xl text-xl text-white your-component-description">
    {event.description}
  </p>
</div>
    </div>
    </>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import banner from "@/assets/banner-user-2.jpg";
import blurHero from "@/assets/blur_7.jpg";
import logo from "@/assets/logo.svg";
import logoMobile from "@/assets/logo_mobile.svg";
import chatIcon from "@/assets/chat.svg";
import teaser01 from "@/assets/kamy02.mp4";
import teaser02 from "@/assets/kamy03.mp4";
import teaserHighlight from "@/assets/teaser-bolzani-1.mp4";
import profileBolzani from "@/assets/profile-bolzani.jpg";
import bolzaniGrid from "@/assets/bolzani-instagram-grid.jpg";
import { Lock, PlayCircle } from "lucide-react";

const subscriptionPlans = [
  {
    label: "Assinar (30 dias)",
    price: "R$ 29,90",
    href: "https://pay.privecy.com.br/checkout/2985a976-e091-4962-a8ca-c61e446f8387",
  },
];

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Track page visit
    supabase.from("analytics_events").insert({ event_type: "visit" });
  }, []);

  const trackEvent = (eventType: string) => {
    supabase.from("analytics_events").insert({ event_type: eventType });
  };
  return (
    <div
      className="min-h-screen bg-background text-foreground"
    >
       <main className="relative overflow-hidden">

          <header className="container flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Privacy Kamylinha logo"
                className="hidden h-8 w-auto md:inline-block"
                loading="lazy"
              />
              <img
                src={logoMobile}
                alt="Privacy Kamylinha logo mobile"
                className="inline-block h-9 w-9 md:hidden"
                loading="lazy"
              />
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Privacy</p>
                <p className="text-sm font-medium">Perfil exclusivo</p>
              </div>
            </div>
            <Button variant="outline" size="icon" aria-label="Abrir chat com suporte">
              <img src={chatIcon} alt="Abrir chat com suporte" className="h-5 w-5" loading="lazy" />
            </Button>
          </header>

          <section className="container space-y-4 pb-16 pt-4">
            {/* Faixa de capa com contadores, similar ao original */}
            <div
              className="relative flex h-40 items-end justify-end overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat md:h-48"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.9), transparent), url(${banner})`,
              }}
              aria-label="Capa do perfil com estatísticas"
            >
              <dl className="mr-4 mb-2 flex gap-3 text-xs text-foreground md:mb-3">
                <div className="flex items-baseline gap-1">
                  <dt className="sr-only">Posts</dt>
                  <dd className="text-sm font-semibold text-foreground">744</dd>
                  <span className="text-[0.7rem] tracking-wide text-foreground/90">posts</span>
                </div>
                <span className="text-foreground/80">•</span>
                <div className="flex items-baseline gap-1">
                  <dt className="sr-only">Curtidas</dt>
                  <dd className="text-sm font-semibold text-foreground">370k</dd>
                  <span className="text-[0.7rem] tracking-wide text-foreground/90">likes</span>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-6 md:grid md:grid-cols-[auto,minmax(0,1fr)] md:items-start">
              {/* Avatar + nome, inspirado no perfil original */}
              <section
                aria-labelledby="perfil-heading"
                className="flex flex-col items-start gap-4 md:flex-row md:items-center"
              >
                <div className="relative -mt-12 md:-mt-16">
                  <div className="relative inline-flex items-center justify-center rounded-full border-4 border-destructive shadow-[0_0_20px_rgba(248,113,113,0.8)]">
                    <img
                      src={profileBolzani}
                      alt="Foto de perfil de Bolzani"
                      className="h-24 w-24 rounded-full object-cover md:h-28 md:w-28"
                      loading="lazy"
                    />
                    <span className="badge-pill absolute -bottom-2 right-0 bg-destructive text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-destructive-foreground shadow-md shadow-destructive/40">
                      AO VIVO
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1
                      id="perfil-heading"
                      className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
                    >
                      Bolzani
                    </h1>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">
                      verificado
                    </span>
                  </div>
                  <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                    Conteúdo adulto exclusivo
                  </p>
                </div>
              </section>

              {/* Cartão de planos, mantendo os mesmos links de checkout, agora só com botões */}
              <section
                aria-labelledby="planos-heading"
                className="space-y-4"
              >
                <header className="space-y-1 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    assine agora
                  </p>
                </header>

                <div className="mt-2 space-y-3">
                  {subscriptionPlans.map((plan) => (
                    <Button
                      key={plan.label}
                      variant="cta"
                      className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold shadow-lg shadow-primary/40 md:text-lg"
                      onClick={async () => {
                        trackEvent("click_plan");
                        try {
                          const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-pix`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                amount: 2990,
                                description: "Assinatura 30 dias - Bolzani",
                                type: "assinatura",
                              }),
                            },
                          );

                          const data = await response.json();

                          if (!response.ok || !data.pix_code) {
                            alert("Não foi possível gerar o pagamento PIX. Tente novamente em alguns minutos.");
                            return;
                          }

                          alert(
                            "Pagamento PIX gerado com sucesso!\n\nCopie e cole o código PIX no seu banco:\n\n" +
                              data.pix_code,
                          );
                        } catch (error) {
                          console.error("Erro ao gerar pagamento PIX", error);
                          alert("Erro inesperado ao gerar o pagamento PIX.");
                        }
                      }}
                    >
                      <span>{plan.label}</span>
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {plan.price}
                      </span>
                    </Button>
                  ))}

                  <Button
                    variant="whatsapp"
                    className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold shadow-lg shadow-emerald-500/40 md:text-lg"
                    asChild
                  >
                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chamar no WhatsApp"
                      onClick={() => trackEvent("click_whatsapp")}
                    >
                      <span>Chamar no WhatsApp</span>
                      <span className="flex items-center gap-2 text-sm font-semibold">R$ 150,00</span>
                    </a>
                  </Button>
                </div>

                 <p className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                   <Lock className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                   <span>
                     Pagamento 100% seguro, cobrança discreta no seu cartão e cancelamento simples a qualquer
                     momento.
                   </span>
                 </p>
              </section>
            </div>
          </section>
        </main>

        <section aria-label="Prévia do conteúdo" className="border-t border-border/60 bg-gradient-to-b from-background to-background/40">
          <div className="container space-y-8 py-10">
            <div className="grid gap-4" aria-label="Prévia em vídeo do conteúdo da Kamylinha">
              <figure className="card-elevated overflow-hidden rounded-3xl">
                <video
                  src={teaserHighlight}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  muted
                />
              </figure>
            </div>

            <figure className="card-elevated overflow-hidden rounded-3xl" aria-label="Prévia em foto do feed da Bolzani">
              <img
                src={bolzaniGrid}
                alt="Prévia do feed da Bolzani com três fotos lado a lado"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </figure>
          </div>
        </section>
    </div>
  );
};

export default Index;

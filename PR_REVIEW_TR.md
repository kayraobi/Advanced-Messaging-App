# Review

## Yapılan iş

Bu PR ile projedeki manuel ekran geçişi yapısı kaldırılarak gerçek bir navigation mimarisine geçildi. Buna ek olarak:

- Event detail ekranına kalan süre göstergesi eklendi
- Profile alanına FAQ ekranı eklendi
- Bu yeni yapılar gerçek API verisine geçiş kolay olacak şekilde düzenlendi

## Navigator Yapısı Ne İşe Yarıyor

Önceden ekran geçişleri `App.tsx` içinde `useState` ile yönetiliyordu. Bu yaklaşım küçük yapılarda çalışsa da proje büyüdükçe:

- geri gitme davranışı zorlaşır
- ekranlar arası parametre taşıma dağılır
- aynı detay ekranını birden fazla yerden açmak karmaşıklaşır
- yeni ekran eklemek zorlaşır

Bu PR ile navigation aşağıdaki şekilde düzenlendi:

- `src/navigation/AppNavigator.tsx`
- `src/navigation/MainTabNavigator.tsx`
- `src/navigation/ProfileStackNavigator.tsx`
- `src/navigation/types.ts`

### Root navigator

`AppNavigator.tsx` uygulamanın ana girişini yönetir.

Örnek:

```tsx
<RootStack.Screen name="MainTabs">
  {() => <MainTabNavigator onLogout={() => setIsLoggedIn(false)} />}
</RootStack.Screen>
<RootStack.Screen name="EventDetail" component={EventDetailRoute} />
<RootStack.Screen name="ChatDetail" component={ChatDetailRoute} />
<RootStack.Screen name="GlobalChat" component={GlobalChatRoute} />
```

Burada:

- giriş yapılmamışsa auth akışı gösterilir
- giriş yapılmışsa tab yapısı açılır
- tab içinden açılan ortak detay ekranları root seviyesinde tutulur

Bu bizim proje için doğru çünkü:

- `EventDetail` hem Home hem Calendar hem My Events içinden açılıyor
- `ChatDetail` Chats alanından açılıyor
- `GlobalChat` ayrı bir ortak ekran

### Bottom tab navigator

`MainTabNavigator.tsx` içinde ana sekmeler tanımlanır:

```tsx
<Tab.Screen name="Home" component={HomeTabRoute} />
<Tab.Screen name="Calendar" component={CalendarTabRoute} />
<Tab.Screen name="Chats" component={ChatsTabRoute} />
<Tab.Screen name="Profile">
  {() => <ProfileStackNavigator onLogout={onLogout} />}
</Tab.Screen>
```

Bu yapı sayesinde:

- Home
- Calendar
- Chats
- Profile

alanları alt tab olarak düzgün ayrılmış oldu.

Örnek olarak `Home` tab içinde event detaya geçiş şu şekilde yapılıyor:

```tsx
<HomeScreen
  onEventPress={(eventId) => navigation.navigate('EventDetail', { eventId })}
/>
```

Yani artık ekran geçişi state değiştirerek değil, gerçek navigation ile yapılıyor.

### Profile stack

`ProfileStackNavigator.tsx` profile altındaki ekranları yönetiyor:

```tsx
<ProfileStack.Screen name="ProfileMain">
  {(props) => <ProfileMainRoute {...props} onLogout={onLogout} />}
</ProfileStack.Screen>
<ProfileStack.Screen name="MyEvents" component={MyEventsRoute} />
<ProfileStack.Screen name="Settings" component={SettingsRoute} />
<ProfileStack.Screen name="FAQ" component={FAQRoute} />
```

Bu yapı sayesinde profile altında yeni ekran eklemek çok kolay hale geldi.

Örnek:

- `My Events`
- `App Settings`
- `FAQ`

gibi alanlar artık tek ekranda modal benzeri yönetilmek yerine gerçek stack ekranı olarak çalışıyor.

## Event Altındaki Remaining Bar Nasıl Çalışıyor

Bu PR ile event detail ekranına kalan süre bilgisi eklendi.

İlgili dosyalar:

- `src/screens/EventDetailScreen.tsx`
- `src/hooks/useEventCountdown.ts`
- `src/utils/eventDate.ts`
- `src/data/events.ts`

### Şu an nasıl çalışıyor

Şu anda event verisi mock data üzerinden geliyor. Event objesi içinde mevcut olarak:

- `date`
- `time`

alanları var.

Ayrıca gerçek veriye hazırlık için opsiyonel `startsAt` alanı eklendi:

```ts
export interface Event {
  id: string;
  title: string;
  startsAt?: string;
  date: string;
  time: string;
}
```

Countdown mantığı şu:

1. Önce event başlangıç tarihi çözülür
2. Eğer `startsAt` varsa doğrudan onu kullanır
3. Yoksa mevcut mock verideki `date + time` alanlarını parse eder
4. Her saniye kalan süre tekrar hesaplanır

Tarih çözümleme örneği:

```ts
if (event.startsAt) {
  const isoDate = new Date(event.startsAt);
  if (isValid(isoDate)) return isoDate;
}

return parse(`${event.date} ${event.time}`, EVENT_DATE_TIME_FORMAT, new Date());
```

Event detail ekrana bağlanışı:

```tsx
const { label: countdownLabel, isPast } = useEventCountdown(event);
```

UI tarafında:

- event gelecekteyse örnek çıktı: `2d 4h 10m`
- saat bazında yaklaştıysa örnek çıktı: `4h 17m 53s`
- event başladıysa: `Event started`

### Gerçek data gelince nasıl değişecek

Bu yapı özellikle kolay geçiş için yazıldı.

Yarın gerçek API geldiğinde ideal veri şöyle olabilir:

```ts
{
  id: '1',
  title: 'Coffee & Connect at Kibe Mahala',
  startsAt: '2026-03-25T18:00:00+01:00'
}
```

Bu durumda ekran tarafında hiçbir şey değişmeyecek.

Sadece API mapper içinde gelen alan app formatına dönüştürülecek:

```ts
const mappedEvent = {
  id: apiEvent.id,
  title: apiEvent.title,
  startsAt: apiEvent.startsAt,
  date: formatDate(apiEvent.startsAt),
  time: formatTime(apiEvent.startsAt),
  location: apiEvent.location,
};
```

Yani:

- countdown hook değişmeyecek
- UI değişmeyecek
- sadece veri mapleme değişecek

Bu da mock datadan gerçek dataya geçişi çok kolaylaştırıyor.

## FAQ Kısmı Nasıl Yapıldı

İlgili dosyalar:

- `src/screens/FAQScreen.tsx`
- `src/data/faqs.ts`
- `src/screens/ProfileScreen.tsx`
- `src/navigation/ProfileStackNavigator.tsx`

Profile içine yeni bir `FAQ` menü maddesi eklendi ve ayrı bir ekran açacak şekilde stack’e bağlandı.

Örnek:

```tsx
{
  icon: 'help-circle-outline' as const,
  label: 'FAQ',
  onPress: onFAQ,
  danger: false,
}
```

Ve stack tarafında:

```tsx
<ProfileStack.Screen name="FAQ" component={FAQRoute} />
```

### Şu an nasıl çalışıyor

`https://sarajevoexpats.com/qaas` sayfası kontrol edildi. Şu an yayında soru listesi görünmüyor ve sayfada `No questions and answers found.` bilgisi yer alıyor.

Bu nedenle ekran şu an:

- FAQ kaynağını gösteriyor
- source page linki sunuyor
- henüz soru olmadığı için boş-state gösteriyor

Veri ayrı dosyada tutuluyor:

```ts
export const faqs: FaqItem[] = [];
```

Bu bilinçli yapıldı; çünkü gerçek data geldiğinde UI’yi değil yalnızca veri kaynağını değiştirmek istiyoruz.

### Gerçek data gelince nasıl değişecek

Gerçek FAQ endpoint’i geldiğinde iki seçenek var:

1. `src/data/faqs.ts` yerine servis katmanından veri çekmek
2. gelen veriyi `FaqItem[]` formatına mapleyip aynı ekranı kullanmak

Örnek:

```ts
const mappedFaqs = apiFaqs.map((item) => ({
  id: item.id,
  question: item.question,
  answer: item.answer,
}));
```

Sonrasında `FAQScreen` aynı kalır; sadece statik `faqs` yerine servis verisi kullanır.

Bu da yine mocktan gerçeğe geçişte ekranı bozmadan ilerlememizi sağlar.

## Sonuç

Bu PR ile:

- manuel navigation yerine gerçek ve sürdürülebilir navigation mimarisi kuruldu
- event detayına gerçek veriye hazır countdown yapısı eklendi
- profile alanına gerçek FAQ verisine hazır FAQ ekranı eklendi

En önemli nokta şu:

Bu değişiklikler sadece bugünü çözmüyor; yarın Sarajevo Expats token ve gerçek verileri geldiğinde minimum kod değişikliğiyle entegrasyon yapabilmemizi sağlıyor.

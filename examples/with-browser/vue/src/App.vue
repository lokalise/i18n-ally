<template lang='pug'>
body.bg-white.text-gray-600.work-sans.leading-normal.text-base.tracking-normal
  nav#header.w-full.z-30.top-0.py-1
    .w-full.container.mx-auto.flex.flex-wrap.items-center.justify-between.mt-0.px-6.py-3
      label.cursor-pointer.block(for='menu-toggle', class='md:hidden')
        svg.fill-current.text-gray-900(xmlns='http://www.w3.org/2000/svg', width='20', height='20', viewBox='0 0 20 20')
          title menu
          path(d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z')
      input#menu-toggle.hidden(type='checkbox')
      #menu.hidden.w-full.order-3(class='md:flex md:items-center md:w-auto md:order-1')
        nav
          ul.items-center.justify-between.text-base.text-gray-700.pt-4(class='md:flex md:pt-0')
            li
              a.inline-block.no-underline.py-2.px-4(class='hover:text-black hover:underline', href='#')
                i18n-ally(path='shop')
            li
              a.inline-block.no-underline.py-2.px-4(class='hover:text-black hover:underline', href='#')
                i18n-ally(path='about')
      .order-1(class='md:order-2')
        a.flex.items-center.tracking-wide.no-underline.font-bold.text-gray-800.text-xl(class='hover:no-underline', href='#')
          svg.fill-current.text-gray-800.mr-2(xmlns='http://www.w3.org/2000/svg', width='24', height='24', viewBox='0 0 24 24')
            path(d='M5,22h14c1.103,0,2-0.897,2-2V9c0-0.553-0.447-1-1-1h-3V7c0-2.757-2.243-5-5-5S7,4.243,7,7v1H4C3.447,8,3,8.447,3,9v11 C3,21.103,3.897,22,5,22z M9,7c0-1.654,1.346-3,3-3s3,1.346,3,3v1H9V7z M5,10h2v2h2v-2h6v2h2v-2h2l0.002,10H5V10z')
          i18n-ally(path='brand')
      #nav-content.order-2.flex.items-center(class='md:order-3')
        a.inline-block.no-underline(class='hover:text-black', href='#')
          svg.fill-current(class='hover:text-black', xmlns='http://www.w3.org/2000/svg', width='24', height='24', viewBox='0 0 24 24')
            circle(fill='none', cx='12', cy='7', r='3')
            path(d='M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5S14.757 2 12 2zM12 10c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3S13.654 10 12 10zM21 21v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h2v-1c0-2.757 2.243-5 5-5h4c2.757 0 5 2.243 5 5v1H21z')
        a.pl-3.inline-block.no-underline(class='hover:text-black', href='#')
          svg.fill-current(class='hover:text-black', xmlns='http://www.w3.org/2000/svg', width='24', height='24', viewBox='0 0 24 24')
            path(d='M21,7H7.462L5.91,3.586C5.748,3.229,5.392,3,5,3H2v2h2.356L9.09,15.414C9.252,15.771,9.608,16,10,16h8 c0.4,0,0.762-0.238,0.919-0.606l3-7c0.133-0.309,0.101-0.663-0.084-0.944C21.649,7.169,21.336,7,21,7z M17.341,14h-6.697L8.371,9 h11.112L17.341,14z')
            circle(cx='10.5', cy='18.5', r='1.5')
            circle(cx='17.5', cy='18.5', r='1.5')
  .carousel.relative.container.mx-auto(style='max-width:1600px;')
    .carousel-inner.relative.overflow-hidden.w-full
      // Slide 1
      input#carousel-1.carousel-open(type='radio', name='carousel', aria-hidden='true', hidden='', checked='checked')
      .carousel-item.absolute.opacity-0(style='height:50vh;')
        .block.h-full.w-full.mx-auto.flex.pt-6.bg-cover.bg-right(class='md:pt-0 md:items-center', style="background-image: url('https://images.unsplash.com/photo-1422190441165-ec2956dc9ecc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1600&q=80');")
          .container.mx-auto
            .flex.flex-col.w-full.items-center.px-6.tracking-wide(class='lg:w-1/2 md:ml-16 md:items-start')
              p.text-black.text-2xl.my-4
                i18n-ally(path='product.stripy-zig-zag-jigsaw-pillow-and-duvet-set')
              a.text-xl.inline-block.no-underline.border-b.border-gray-600.leading-relaxed(class='hover:text-black hover:border-black', href='#')
                i18n-ally(path='view-product')

  p.text-white.px-5(style='background:grey')
    i18n-ally(path='current_language' :args='[$t("name")]')
    span.pl-1 ({{$i18n.locale}})

  footer.container.mx-auto.bg-white.py-5.border-t.border-gray-400
    .container.flex.px-3.py-8
      .w-full.mx-auto.flex.flex-wrap
        .flex.w-full(class='lg:w-1/2')
          .px-3(class='md:px-0')
            h3.font-bold.text-gray-900
              i18n-ally(path='about')
            p.py-4
              i18n-ally(path='about_description')
</template>

<script>
import i18nAlly from './i18n-ally.vue'

export default {
  name: 'App',
  components: {
    i18nAlly,
  },
  watch: {
    '$i18n.locale': function() {
      localStorage.setItem('locale', this.$i18n.locale)
    },
  },
}
</script>

<style>
.worksans {
  font-family: 'Work Sans', sans-serif;
}

#menu-toggle:checked + #menu {
  display: block;
}

.carousel-open:checked + .carousel-item {
  position: static;
  opacity: 100;
}

.carousel-item {
  -webkit-transition: opacity 0.6s ease-out;
  transition: opacity 0.6s ease-out;
}
</style>

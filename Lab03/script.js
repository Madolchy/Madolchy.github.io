alert("Salut!");
console.log("Apare in consola!");
document.write("asddsa");

var nume = "Koma"
var an = 21
var media = (10 + 8) / 2

console.log(`Studentul ${nume} are ${an} ani si are media ${media}`)

var add = (a, b) => a + b
var mul = (a, b) => a * b

console.log(add(an, media), mul(an, media))

var mp = []
for (i = 0; i < 10; i++){
    mp.push(i)
}

mp = mp.map((e) => (e * 10))
mp.forEach((e) => { console.log("Nr: " + e) });

var car = {
    brand: "Honda",
    model: "10",
    an: 1999
}

console.log(car)
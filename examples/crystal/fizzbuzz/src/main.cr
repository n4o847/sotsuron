puts "Please input a number."

n = gets.not_nil!.to_i

puts "Your input: #{n}"

1.upto(n) do |i|
  case {i % 3, i % 5}
  when {0, 0}
    puts "FizzBuzz"
  when {0, _}
    puts "Fizz"
  when {_, 0}
    puts "Buzz"
  else
    puts i
  end
end

require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'

  gem 'pry-byebug'
end

def calc_c(n:, r:)
  fact(n) / (fact(n - r) * fact(r))
end

def calc_p(n:, r:)
  fact(n) / fact(n - r)
end

def fact(n)
  (1..n).inject(1) {|f, i| f * i }
end

# result = calc_c(n: 12, r: 3) * calc_c(n: 9, r: 3) * calc_c(n: 6, r: 3) / (calc_c(n: 3, r: 3) * calc_c(n: 4, r: 3) * calc_c(n: 5, r: 3))
result = calc_c(n: 12, r: 3) * calc_c(n: 9, r: 3) * calc_c(n: 6, r: 3)
p result

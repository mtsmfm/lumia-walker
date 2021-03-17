require 'bundler/inline'

gemfile do
  source 'https://rubygems.org'

  gem 'pry-byebug'
end

items = {a: 3, b: 4, c: 5}.flat_map {|k, v| [k] * v }
item_indexes = items.size.times.to_a
box_count = 4
per_box = item_indexes.count.to_r / box_count

boxes = box_count.times.map do |i|
  a = (i * per_box).floor
  b = ((i + 1) * per_box).floor
  b - a
end

result = boxes[1..-1].reduce(item_indexes.combination(boxes[0]).map {|xs| [xs] }) do |acc, n|
  acc.flat_map do |xs|
    (item_indexes - xs.flatten).combination(n).map do |ys|
      xs + [ys]
    end
  end
end.map do |xss|
  xss.map do |xs|
    items.values_at(*xs)
  end
end
# .select do |xss|
#   xss.all? {|xs| xs.uniq.count > 1 }
# end

all_boxes = result.flatten(1)
a_count = all_boxes.count {|xs| xs.include?(:a) }

p result.count
p all_boxes.count
p a_count
p a_count / all_boxes.count.to_f

binding.pry
binding.pry
